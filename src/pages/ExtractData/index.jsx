/*
Creator:            Chanakan C.
Creation date:      22/Apr/2021
*/

import logo from '../../assets/allpay_logo.png';
import { DeleteOutlined, FileExcelTwoTone, FilePdfTwoTone, FormOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Divider, Form, Input, message, Modal, Popconfirm, Radio, RangePicker, Row, Select, Space, Spin, Tag, Tooltip, Switch } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { FormattedMessage } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { IntlProvider, enUSIntl } from '@ant-design/pro-table';
import UpdateForm from './components/UpdateForm';
import UploadManually from './UploadManually';
import { getDocument, getVendorByDocumentCode, getAdditionalInfoByDocumentCodeVendorCode, updateOCRFileStatus, getTotalPageExtracted } from './service';
import {
  deleteMultipleOCRFilesByFileId,
  deleteOCRFileByFileId,
  getMasterFileStatus,
  getOCRFileList,
  getOCRFileContentByFileId,
  getOCRFileById,
  getOCRFileExportExcelByFileId,
  sendToAllpay,
  sendToAllpayMultiple,
  getOCRResultByFileId
} from './service';
import { getPaymentLocationsListByPaymentTypeCodeCompanyCode } from '@/services/paymentLocation';
import styles from './index.less';

import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import fieldName from '@/utils/fieldName';
import tokenManager from '@/utils/token';

const INTERVAL_TIME = 5 * 1000
const userProfile = tokenManager.decode(tokenManager.get());

/**
 * @param fields
 */

const centerStyle = {
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
  textAlign: 'center',
}

const handleUpdate = async (formVals) => {
  const hide = message.loading('Submitting to Allpay...');
  try {
    sendToAllpay(formVals.file_id, formVals.fields).then((res) => {
      hide();
      if (res.status === 'success') {
        message.success('Submit to Allpay Success');
        window.setTimeout(function () {
          window.location.reload();
        }, 5000);
      } else {
        Modal.info({
          title: res.status,
          content: (
            <div>
              {res.message}
            </div>
          ),
          onOk() { },
        });
      }
      return true;
    });
  } catch (error) {
    hide();
    message.error('Submit to Allpay Failed');
    return false;
  }
}

function createAndDownloadBlobFile(body, filename, extension = 'pdf') {
  const blob = new Blob([body]);
  const fileName = `${filename}.${extension}`;
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, fileName);
  } else {
    const link = document.createElement('a');
    // Browsers that support HTML5 download attribute
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";

const exportToExcel = (apiData, fileName) => {
  const ws = XLSX.utils.json_to_sheet(apiData);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
};

/**
 * @param selectedRows
 */

const TableList = () => {
  const [form] = Form.useForm();

  const [data, setData] = useState();
  const [fetching, setFetching] = useState();
  const [fileStatusList, setFileStatusList] = useState([]);
  const [loading, showLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [sorter, setSorter] = useState('desc');
  const [stepFormValues, setStepFormValues] = useState({});
  const [searchedColumn, setSearchedColumn] = useState('');
  const [searchText, setSearchText] = useState([]);
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [ocrDateFilter, setOcrDateFilter] = useState(undefined);
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [additionalInfoList, setAdditionalInfoList] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [paymentLocation, setPaymentLocation] = useState([]);

  const [totalPageExtracted, setTotalPageExtracted] = useState(0);

  const actionRef = useRef();
  const dropdownRef = useRef();
  const inputRef = useRef();

  const format = ('DD/MM/YYYY');

  const fileStatusOptions = fileStatusList.map(d => <Select.Option key={d.value}>{d.text}</Select.Option>);
  const documentTypeOptions = documentTypeList.map(d => <Select.Option key={d.value}>{d.text}</Select.Option>);
  const vendorOptions = vendorList.map(d => <Select.Option key={d.value}>{d.text}</Select.Option>);
  const additionalInfoOptions = additionalInfoList.map(d => <Select.Option key={d.value}>{d.text}</Select.Option>);

  const onUploadedByChange = ({ uploadedBy }) => {
    if (uploadedBy) {
      form.setFieldsValue({ uploadedBy });
    }
  };

  const handleReset = (clearFilters, dataIndex) => {
    if (dataIndex = 'ocr_date') {
      setOcrDateFilter(undefined);
    }
    clearFilters();
    setSearchText([]);
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText([selectedKeys[0]]);
    setSearchedColumn(dataIndex);
  };

  const handleFileStatusSelect = () => {
    setFetching(true);
    getMasterFileStatus().then((result) => {
      const fileStatusData = [];
      result.forEach(r => {
        fileStatusData.push({
          value: r.code,
          text: r.name,
        });
      });
      setFetching(false);
      setFileStatusList(fileStatusData);
    });
  }

  const handleSendToAllpay = (file_id) => {
    const hide = message.loading('Submitting to Allpay...');
    try {
      getOCRResultByFileId(file_id).then((response) => {
        validateValue(response).then((data) => {
          if (data.isError) {
            Modal.error({
              title: 'Error',
              content: <NewlineText text={data.errorMessage} />,
            });
            return;
          } else {
            const indexCreator = response.findIndex(item => item.display_name === fieldName.creator);
            const indexCreateDate = response.findIndex(item => item.display_name === fieldName.createDate);
            if (indexCreator !== -1) {
              response[indexCreator].ocr_result = '';
            }
            if (indexCreateDate !== -1) {
              response[indexCreateDate].ocr_result = '';
            }
            sendToAllpay(file_id, response).then((res) => {
              if (res.status === 'success') {
                message.success('Submit to Allpay Success');
                refreshPage();
              } else {
                Modal.info({
                  title: res.status,
                  content: (
                    <div>
                      {res.message}
                    </div>
                  ),
                  onOk() { },
                });
              }
            })
          }
        });
      });
    } catch (error) {
      hide();
      message.error('Submit to Allpay Failed');
    }
  }

  const validateValue = async (fields) => {
    var errorMessage = '';
    if (!(fields[0].ocr_status === 'AF' || fields[0].ocr_status === 'R')) {
      errorMessage = errorMessage + fields[0].original_name + ' is ' + fields[0].status_name + ' status.' + '\n';
    } else {
      const indexIsForeignPayment = fields.findIndex(item => item.display_name === fieldName.foreignPayment);
      const valueIsForeignPayment = indexIsForeignPayment === -1 ? 'false' : fields[indexIsForeignPayment].ocr_result === 'true' ? 'true' : 'false';
      fields.forEach(function (item) {
        if (item.display_name !== fieldName.createDate && item.display_name !== fieldName.creator) {
          if (item.is_requirefield === 'Y' && (item.ocr_result === '' || item.ocr_result === undefined || item.ocr_result === 'undefined' || item.ocr_result === null)) {
            if (item.display_name === fieldName.vatBaseTotalAmount) {
              const indexVatRate = fields.findIndex(item => item.display_name === fieldName.vatRate);
              if (indexVatRate !== -1) {
                if (fields[indexVatRate].ocr_result !== '0') {
                  errorMessage = errorMessage + item.display_name + ' is require field.' + '\n';
                }
              } else {
                errorMessage = errorMessage + item.display_name + ' is require field.' + '\n';
              }
            } else if (item.display_name === fieldName.whtBaseTotalAmount) {
              const indexWhtRate = fields.findIndex(item => item.display_name === fieldName.whtRate);
              if (indexWhtRate !== -1) {
                if (fields[indexWhtRate].ocr_result !== '0') {
                  errorMessage = errorMessage + item.display_name + ' is require field.' + '\n';
                }
              } else {
                errorMessage = errorMessage + item.display_name + ' is require field.' + '\n';
              }
            } else {
              errorMessage = errorMessage + item.display_name + ' is require field.' + '\n';
            }
          } else {

            if (item.display_name === fieldName.paymentType && (item.ocr_result !== '' || item.ocr_result !== undefined || item.ocr_result !== 'undefined' || item.ocr_result !== null)) {
              const indexCompany = fields.findIndex(item => item.display_name === fieldName.company);
              if (indexCompany === -1) {
                errorMessage = errorMessage + item.display_name + ' is require field.' + '\n';
              } else {
                getPaymentLocationsListByPaymentTypeCodeCompanyCode(item.ocr_result, fields[indexCompany].ocr_result).then((data) => {
                  var count = 0
                  data.forEach(function (p) {
                    if (p.paymenttype_code === item.ocr_result) {
                      count = count + 1;
                    }
                  });
                  if (count > 0) {
                    // Payment Location
                    const indexPaymentLocation = fields.findIndex(item => item.display_name === fieldName.paymentLocation);
                    if (indexPaymentLocation === -1) {
                      errorMessage = errorMessage + 'Not found ' + fieldName.paymentLocation + '.' + '\n';
                    } else {
                      if (fields[indexPaymentLocation].ocr_result === '' || fields[indexPaymentLocation].ocr_result === undefined || fields[indexPaymentLocation].ocr_result === 'undefined' || fields[indexPaymentLocation].ocr_result === null)
                        errorMessage = errorMessage + 'Select ' + fieldName.paymentLocation + '.' + '\n';
                    }
                  }
                });
              }
            }
            // Check Others Information
            if (item.display_name === fieldName.otherAmount && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== 'undefined' && item.ocr_result !== null)) {
              const indexOtherExplanation = fields.findIndex(item => item.display_name === fieldName.otherExplanation);
              if (indexOtherExplanation === -1) {
                errorMessage = errorMessage + 'Not found ' + fieldName.otherExplanation + '.' + '\n';
              } else {
                const valueOtherExplanation = fields[indexOtherExplanation].ocr_result;
                if (valueOtherExplanation === '' || valueOtherExplanation === undefined || valueOtherExplanation === 'undefined' || valueOtherExplanation === null) {
                  errorMessage = errorMessage + fieldName.otherExplanation + ' is require field.' + '\n';
                }
              }
            }

            if (item.display_name === fieldName.otherExplanation && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== 'undefined' && item.ocr_result !== null)) {
              const indexOtherAmount = fields.findIndex(item => item.display_name === fieldName.otherAmount);
              if (indexOtherAmount === -1) {
                errorMessage = errorMessage + 'Not found ' + fieldName.otherAmount + '.' + '\n';
              } else {
                const valueOtherAmount = fields[indexOtherAmount].ocr_result;
                if (valueOtherAmount === '' || valueOtherAmount === undefined || valueOtherAmount === 'undefined' || valueOtherAmount === null) {
                  errorMessage = errorMessage + fieldName.otherAmount + ' is require field.' + '\n';
                }
              }
            }

            // Check Alternative Payee
            if (item.display_name === fieldName.alternativePayeeAmount && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== 'undefined' && item.ocr_result !== null)) {
              const indexAlternativePayeeVendorCode = fields.findIndex(item => item.display_name === fieldName.alternativePayeeVendor);
              if (indexAlternativePayeeVendorCode === -1) {
                errorMessage = errorMessage + 'Not found ' + fieldName.alternativePayeeVendor + '.' + '\n';
              } else {
                const valueAlternativePayeeVendorCode = fields[indexAlternativePayeeVendorCode].ocr_result;
                if (valueAlternativePayeeVendorCode === '' || valueAlternativePayeeVendorCode === undefined || valueAlternativePayeeVendorCode === 'undefined' || valueAlternativePayeeVendorCode === null) {
                  errorMessage = errorMessage + fieldName.alternativePayeeVendor + ' is require field.' + '\n';
                }
              }
            }

            if (item.display_name === fieldName.alternativePayeeVendor && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== 'undefined' && item.ocr_result !== null)) {
              const indexAlternativePayeeAmount = fields.findIndex(item => item.display_name === fieldName.alternativePayeeAmount);
              if (indexAlternativePayeeAmount === -1) {
                errorMessage = errorMessage + 'Not found ' + fieldName.alternativePayeeAmount + '.' + '\n';
              } else {
                const valueAlternativePayeeAmount = fields[indexAlternativePayeeAmount].ocr_result;
                if (valueAlternativePayeeAmount === '' || valueAlternativePayeeAmount === undefined || valueAlternativePayeeAmount === 'undefined' || valueAlternativePayeeAmount === null) {
                  errorMessage = errorMessage + fieldName.alternativePayeeAmount + ' is require field.' + '\n';
                }
              }
            }

            if (valueIsForeignPayment === 'true' &&
              (item.display_name === fieldName.allBankChargeOutsideCompanyCountryFor ||
                item.display_name === fieldName.allBankChargeInsideCompanyCountryFor ||
                item.display_name === fieldName.paidFor ||
                item.display_name === fieldName.preAdvice ||
                item.display_name === fieldName.remittedCurrency ||
                item.display_name === fieldName.remittedToCurrency) &&
              (item.ocr_result === '' || item.ocr_result === undefined || item.ocr_result === 'undefined' || item.ocr_result === null)) {
              errorMessage = errorMessage + item.display_name + ' is require field.' + '\n';
            }

            if (item.field_type === 'D') {
              var result = item.ocr_result === '' || item.ocr_result === undefined || item.ocr_result === 'undefined' || item.ocr_result === null ? '0' : item.ocr_result;
              if (!isNumber(result) || Number.isNaN(result)) {
                errorMessage = errorMessage + item.display_name + ' invalid number.' + '\n';
              }
            }

            if (item.field_type === 'DT' && !Date.parse(item.ocr_result)) {
              errorMessage = errorMessage + item.display_name + ' invalid date.' + '\n';
            }
          }
        }
      });
    }


    errorMessage = errorMessage === '' ? errorMessage : errorMessage.substring(0, errorMessage.length - 2)

    console.log("errorMessage: ", errorMessage)
    if (errorMessage === '') {
      return { 'isError': false, 'errorMessage': errorMessage };
    } else {
      return { 'isError': true, 'errorMessage': errorMessage };
    }
  };

  const handleExportExcelAll = () => {
    setLoadingText('Exporting Excel all...');
    showLoading(true);
    const selectedData = data.filter(item => selectedRowKeys.includes(item.file_id))
    const exportData = selectedData.map(item => {
      let temp = Object.assign({})
      columns.forEach(column => {
        let value = item[column.dataIndex] ? item[column.dataIndex] : ''
        if (column.title === 'Status') {
          value = mappingStatus(item[column.dataIndex])
        }
        if (!["Action"].includes(column.title)) {
          temp[column.title] = value
        }

      })
      return temp
    })
    const fileName = 'Extract-Data';
    exportToExcel(exportData, fileName)
    showLoading(false);
  }

  const handleSendToAllpayMultiple = () => {
    const hide = message.loading('Submitting to Allpay...');
    try {
      var fieldsList = [];
      var counter = 0;
      selectedRowKeys.forEach(e => {
        getOCRResultByFileId(e).then((data) => {
          counter = counter + 1;
          const indexCreator = data.findIndex(item => item.display_name === fieldName.creator);
          const indexCreateDate = data.findIndex(item => item.display_name === fieldName.createDate);
          if (indexCreator !== -1) {
            data[indexCreator].ocr_result = '';
          }
          if (indexCreateDate !== -1) {
            data[indexCreateDate].ocr_result = '';
          }
          console.log(data);
          fieldsList.push(data);
          if (selectedRowKeys.length === counter) {
            validateValueMultiple(fieldsList).then((data) => {
              if (data.isError) {
                Modal.error({
                  title: 'Error',
                  content: <NewlineText text={data.errorMessage} />,
                });
                return;
              } else {
                sendToAllpayMultiple(selectedRowKeys, fieldsList).then((res) => {
                  if (res.status === 'success') {
                    message.success('Submit to Allpay Success');
                    refreshPage();
                  } else {
                    Modal.info({
                      title: res.status,
                      content: (
                        <div>
                          {res.message}
                        </div>
                      ),
                      onOk() { },
                    });
                  }
                })
              }
            });
          }
        });
      })

    } catch (error) {
      hide();
      message.error('Submit to Allpay Failed');
    }
  }

  function isNumber(n) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
  }

  function NewlineText(props) {
    const text = props.text;
    return text.split('\n').map(str => <p>{str}</p>);
  }

  const validateValueMultiple = async (fieldsList) => {
    var errorMessage = '';
    var isPurchaseOrder = false;

    fieldsList.forEach(function (fields) {
      var error = '';
      var fileName = '';

      if (!(fields[0].ocr_status === 'AF' || fields[0].ocr_status === 'R')) {
        error = error + fields[0].original_name + ' is ' + fields[0].status_name + ' status.' + '\n';
      } else {
        const indexIsForeignPayment = fields.findIndex(item => item.display_name === fieldName.foreignPayment);
        const valueIsForeignPayment = indexIsForeignPayment === -1 ? 'false' : fields[indexIsForeignPayment].ocr_result === 'true' ? 'true' : 'false';

        fields.forEach(function (item) {
          if (item.display_name !== fieldName.createDate && item.display_name !== fieldName.creator) {
            fileName = item.original_name;
            if (item.is_requirefield === 'Y' && (item.ocr_result === '' || item.ocr_result === undefined || item.ocr_result === 'undefined' || item.ocr_result === null)) {
              if (item.display_name === fieldName.vatBaseTotalAmount) {
                const indexVatRate = fields.findIndex(item => item.display_name === fieldName.vatRate);
                if (indexVatRate !== -1) {
                  if (fields[indexVatRate].ocr_result !== '0') {
                    error = error + item.display_name + ' is require field.' + '\n';
                  }
                } else {
                  error = error + item.display_name + ' is require field.' + '\n';
                }
              } else if (item.display_name === fieldName.whtBaseTotalAmount) {
                const indexWhtRate = fields.findIndex(item => item.display_name === fieldName.whtRate);
                if (indexWhtRate !== -1) {
                  if (fields[indexWhtRate].ocr_result !== '0') {
                    error = error + item.display_name + ' is require field.' + '\n';
                  }
                } else {
                  error = error + item.display_name + ' is require field.' + '\n';
                }
              } else {
                error = error + item.display_name + ' is require field.' + '\n';
              }
            } else {

              if (item.display_name === fieldName.paymentType && (item.ocr_result !== '' || item.ocr_result !== undefined || item.ocr_result !== 'undefined' || item.ocr_result !== null)) {
                const indexCompany = fields.findIndex(item => item.display_name === fieldName.company);
                if (indexCompany === -1) {
                  error = error + item.display_name + ' is require field.' + '\n';
                } else {
                  getPaymentLocationsListByPaymentTypeCodeCompanyCode(item.ocr_result, fields[indexCompany].ocr_result).then((data) => {
                    var count = 0
                    data.forEach(function (p) {
                      if (p.paymenttype_code === item.ocr_result) {
                        count = count + 1;
                      }
                    });
                    if (count > 0) {
                      // Payment Location
                      const indexPaymentLocation = fields.findIndex(item => item.display_name === fieldName.paymentLocation);
                      if (indexPaymentLocation === -1) {
                        error = error + 'Not found ' + fieldName.paymentLocation + '.' + '\n';
                      } else {
                        if (fields[indexPaymentLocation].ocr_result === '' || fields[indexPaymentLocation].ocr_result === undefined || fields[indexPaymentLocation].ocr_result === 'undefined' || fields[indexPaymentLocation].ocr_result === null)
                          error = error + 'Select ' + fieldName.paymentLocation + '.' + '\n';
                      }
                    }
                  });
                }
              }
              /*
              if (item.display_name === fieldName.currency && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== null)) {
                const indexExchangeRate = fields.findIndex(item => item.display_name === fieldName.exchangeRate);
                if (indexExchangeRate === -1) {
                  if (item.ocr_result !== 'THB') {
                    error = error + 'Not found ' + fieldName.exchangeRate +'.' + '\n';
                  }
                } else {
                  const valueExchangeRate = fields[indexExchangeRate].ocr_result;
                  if (valueExchangeRate === '' || valueExchangeRate === undefined || valueExchangeRate === null) {
                    error = error +'Input ' + fieldName.exchangeRate + '.' + '\n';
                  }
                } 
              }
              */
              // Check Others Information
              if (item.display_name === fieldName.otherAmount && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== 'undefined' && item.ocr_result !== null)) {
                const indexOtherExplanation = fields.findIndex(item => item.display_name === fieldName.otherExplanation);
                if (indexOtherExplanation === -1) {
                  error = error + 'Not found ' + fieldName.otherExplanation + '.' + '\n';
                } else {
                  const valueOtherExplanation = fields[indexOtherExplanation].ocr_result;
                  if (valueOtherExplanation === '' || valueOtherExplanation === undefined || valueOtherExplanation === 'undefined' || valueOtherExplanation === null) {
                    error = error + fieldName.otherExplanation + ' is require field.' + '\n';
                  }
                }
              }

              if (item.display_name === fieldName.otherExplanation && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== 'undefined' && item.ocr_result !== null)) {
                const indexOtherAmount = fields.findIndex(item => item.display_name === fieldName.otherAmount);
                if (indexOtherAmount === -1) {
                  error = error + 'Not found ' + fieldName.otherAmount + '.' + '\n';
                } else {
                  const valueOtherAmount = fields[indexOtherAmount].ocr_result;
                  if (valueOtherAmount === '' || valueOtherAmount === undefined || valueOtherAmount === 'undefined' || valueOtherAmount === null) {
                    error = error + fieldName.otherAmount + ' is require field.' + '\n';
                  }
                }
              }

              // Check Alternative Payee
              if (item.display_name === fieldName.alternativePayeeAmount && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== 'undefined' && item.ocr_result !== null)) {
                const indexAlternativePayeeVendorCode = fields.findIndex(item => item.display_name === fieldName.alternativePayeeVendor);
                if (indexAlternativePayeeVendorCode === -1) {
                  error = error + 'Not found ' + fieldName.alternativePayeeVendor + '.' + '\n';
                } else {
                  const valueAlternativePayeeVendorCode = fields[indexAlternativePayeeVendorCode].ocr_result;
                  if (valueAlternativePayeeVendorCode === '' || valueAlternativePayeeVendorCode === undefined || valueAlternativePayeeVendorCode === 'undefined' || valueAlternativePayeeVendorCode === null) {
                    error = error + fieldName.alternativePayeeVendor + ' is require field.' + '\n';
                  }
                }
              }

              if (item.display_name === fieldName.alternativePayeeVendor && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== 'undefined' && item.ocr_result !== null)) {
                const indexAlternativePayeeAmount = fields.findIndex(item => item.display_name === fieldName.alternativePayeeAmount);
                if (indexAlternativePayeeAmount === -1) {
                  error = error + 'Not found ' + fieldName.alternativePayeeAmount + '.' + '\n';
                } else {
                  const valueAlternativePayeeAmount = fields[indexAlternativePayeeAmount].ocr_result;
                  if (valueAlternativePayeeAmount === '' || valueAlternativePayeeAmount === undefined || valueAlternativePayeeAmount === 'undefined' || valueAlternativePayeeAmount === null) {
                    error = error + fieldName.alternativePayeeAmount + ' is require field.' + '\n';
                  }
                }
              }

              if (valueIsForeignPayment === 'true' &&
                (item.display_name === fieldName.allBankChargeOutsideCompanyCountryFor ||
                  item.display_name === fieldName.allBankChargeInsideCompanyCountryFor ||
                  item.display_name === fieldName.paidFor ||
                  item.display_name === fieldName.preAdvice ||
                  item.display_name === fieldName.remittedCurrency ||
                  item.display_name === fieldName.remittedToCurrency) &&
                (item.ocr_result === '' || item.ocr_result === undefined || item.ocr_result === 'undefined' || item.ocr_result === null)) {
                error = error + item.display_name + ' is require field.' + '\n';
              }

              if (item.display_name === fieldName.po && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== 'undefined' && item.ocr_result !== null)) {
                isPurchaseOrder = true;
              }

              if (item.field_type === 'D') {
                var result = item.ocr_result === '' || item.ocr_result === undefined || item.ocr_result === 'undefined' || item.ocr_result === null ? '0' : item.ocr_result;
                if (!isNumber(result) || Number.isNaN(result)) {
                  error = error + item.display_name + ' invalid number.' + '\n';
                }
              }

              if (item.field_type === 'DT' && !Date.parse(item.ocr_result)) {
                error = error + item.display_name + ' invalid date.' + '\n';
              }
            }
          }
        });
      }

      if (error !== '') {
        errorMessage = errorMessage + 'File Name: ' + fileName + '\n' + error
      }
    });

    if (errorMessage === '' && fieldsList.length > 1 && isPurchaseOrder === true) {
      fieldsList.forEach(function (fields) {
        var error = '';
        const indexPO = fields.findIndex(item => item.display_name === fieldName.po);
        if (indexPO === -1) {
          error = error + 'Not found ' + fieldName.po + '.' + '\n';
        } else {
          if (fields[indexPO].ocr_result === '' || fields[indexPO].ocr_result === undefined || fields[indexPO].ocr_result === 'undefined' || fields[indexPO].ocr_result === null) {
            error = error + fieldName.po + ' is require field.' + '\n';
          }
        }

        if (error !== '') {
          errorMessage = errorMessage + 'File Name: ' + fileName + '\n' + error
        }
      });
    }

    if (errorMessage === '' && fieldsList.length > 1) {
      var error = ''
      for (let fields of fieldsList) {
        for (let item of fields) {
          if (item.field_data === 'H' &&
            (item.display_name !== fieldName.creator &&
              item.display_name !== fieldName.createDate &&
              item.display_name !== fieldName.alternativePayeeAmount &&
              item.display_name !== fieldName.alternativePayeeVendor &&
              item.display_name !== fieldName.otherExplanation &&
              item.display_name !== fieldName.otherAmount)) {
            item.ocr_result = item.ocr_result === undefined || item.ocr_result === 'undefined' || item.ocr_result === null ? '' : item.ocr_result;
            for (let loopFields of fieldsList) {
              const index = loopFields.findIndex(i => i.display_name === item.display_name);
              if (index === -1) {
                error = error + 'Header is mismatch.' + '\n';
                break;
              } else {
                var value = loopFields[index].ocr_result;
                value = value === undefined || value === null ? '' : value
                if (value !== item.ocr_result) {
                  error = error + 'Header is mismatch.' + '\n';
                  break;
                }
              }
            }
          }

          if (error !== '') {
            break;
          }
        }
        if (error !== '') {
          break;
        }
      }
      errorMessage = errorMessage + error;
    }

    errorMessage = errorMessage === '' ? errorMessage : errorMessage.substring(0, errorMessage.length - 2)

    console.log("errorMessage: ", errorMessage)
    if (errorMessage === '') {
      return { 'isError': false, 'errorMessage': errorMessage };
    } else {
      return { 'isError': true, 'errorMessage': errorMessage };
    }
  };

  function refreshPage() {
    window.setTimeout(function () {
      window.location.reload();
    }, 5000);
  }


  const getColumnSearchProps = (title, dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        {(dataIndex === 'original_name' || dataIndex === 'invoice_no' || dataIndex === 'vendor_name'
          || dataIndex === 'allpay_no' || dataIndex === 'create_name') && (
            <Input
              ref={inputRef}
              placeholder={`Search ${title}`}
              value={selectedKeys[0]}
              onChange={e => {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
              }}
              onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
          )}
        {(dataIndex === 'ocr_status') && (
          <>
            <Select
              ref={dropdownRef}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              placeholder={`Search ${title}`}
              onSelect={value => {
                setSelectedKeys(value ? [value] : []);
              }}
              onClick={() => handleFileStatusSelect()}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            >
              {fileStatusOptions}
            </Select>
          </>
        )}
        {(dataIndex === 'ocr_date') && (
          <>
            <DatePicker
              format={format}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              onChange={value => {
                setOcrDateFilter(value);
                setSelectedKeys(value ? [value.format(format)] : []);
              }}
              placeholder={`Search ${title}`}
              value={ocrDateFilter}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
          </>
        )}
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => (
      record[dataIndex]
        ? (dataIndex !== 'ocr_status'
          ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
          : record[dataIndex].toString().toLowerCase() === value.toLowerCase())
        : ''
    ),
    onFilterDropdownVisibleChange: visible => {
      if (dataIndex !== 'ocr_status' && dataIndex !== 'ocr_date') {
        if (visible) {
          setTimeout(() => inputRef.current.select(), 100);
        }
      }
    },
    render: text => (
      searchedColumn === dataIndex ? (
        <Highlighter
          autoEscape
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={searchText}
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
    ),
  });

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys)
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      name: record.name,
    }),
  };

  const mappingStatus = (status) => {
    switch (status) {
      case 'U':
        return 'Uploaded';
      case 'IP':
        return 'In-progress';
      case 'R':
        return 'Reviewed';
      case 'WR':
        return 'Waiting for Review';
      case 'SA':
        return 'Send to Allpay';
      case 'AS':
        return 'Allpay Success';
      case 'F':
        return 'Failed';
      case 'AF':
        return 'Allpay Failed';
      default:
        return status;
    }
  }

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'original_name',
      key: 'original_name',
      width: 100,
      rules: [
        {
          required: true,
          message: 'required',
        },
      ],
      onCell: () => {
        return {
          style: {
            whiteSpace: 'normal',
          },
        };
      },
      ...getColumnSearchProps('File Name', 'original_name'),
    },
    {
      title: 'Document No.', // Invoice number
      dataIndex: 'invoice_no',
      width: 140,
      onCell: () => {
        return {
          style: {
            whiteSpace: 'nowrap',
          },
        };
      },
      ...getColumnSearchProps('Document No.', 'invoice_no'),
    },
    {
      title: 'Company',
      dataIndex: 'company_code',
      hideInForm: true,
      width: 100,
      onCell: () => {
        return {
          style: {
            whiteSpace: 'normal',
          },
        };
      },
      ...getColumnSearchProps('Company', 'company_code'),
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_name',
      hideInForm: true,
      width: 130,
      onCell: () => {
        return {
          style: {
            whiteSpace: 'normal',
          },
        };
      },
      ...getColumnSearchProps('Vendor', 'vendor_name'),
    },
    {
      title: 'Date',
      dataIndex: 'ocr_date',
      width: 50,
      defaultSortOrder: 'descend',
      ...getColumnSearchProps('Date', 'ocr_date'),
    },
    {
      title: 'Status',
      dataIndex: 'ocr_status',
      width: 50,
      ...getColumnSearchProps('Status', 'ocr_status'),
      render: (_, record) => (
        <>
          {record.is_delete === "N" ?
            <>
              {(record.ocr_status === 'U') && (
                <Tag color="LightGray" style={centerStyle}>{mappingStatus(record.ocr_status)}</Tag>
              )}
              {(record.ocr_status === 'IP') && (
                <Tag color="LightGray" style={centerStyle}>{mappingStatus(record.ocr_status)}</Tag>
              )}
              {(record.ocr_status === 'R') && (
                <Tag color="green" style={centerStyle}>{mappingStatus(record.ocr_status)}</Tag>
              )}
              {(record.ocr_status === 'WR') && (
                <Tag color="orange" style={centerStyle}>{mappingStatus(record.ocr_status)}</Tag>
              )}
              {(record.ocr_status === 'SA') && (
                <Tag color="cyan" style={centerStyle}>{mappingStatus(record.ocr_status)}</Tag>
              )}
              {(record.ocr_status === 'AS') && (
                <Tag color="SkyBlue" style={centerStyle}>{mappingStatus(record.ocr_status)}</Tag>
              )}
              {(record.ocr_status === 'F') && (
                <Tag color="red" style={centerStyle}>{mappingStatus(record.ocr_status)}</Tag>
              )}
              {(record.ocr_status === 'AF') && (
                <Tag color="volcano" style={centerStyle}>{mappingStatus(record.ocr_status)}</Tag>
              )}
            </>
            : <Tag color="red" style={centerStyle}>{"Deleted"}</Tag>}
        </>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
      onCell: () => {
        return {
          style: {
            whiteSpace: 'nowrap',
          },
        };
      },
      render: (_, record) => (
        <>
          {record.is_delete === "N" ?
            <>
              <Tooltip placement="topLeft" title="Review & Edit">
                <FormOutlined
                  onClick={() => {
                    setLoadingText('Loading ...');
                    showLoading(true);

                    updateOCRFileStatus(record.file_id, 'R');

                    getOCRFileById(record.file_id).then((res) => {
                      handleUpdateModalVisible(true);
                      setStepFormValues(res.data);
                      showLoading(false);
                    });
                  }}
                />
              </Tooltip>

              {(record.ocr_status === 'U' || record.ocr_status === 'IP' || record.ocr_status === 'WR' || record.ocr_status === 'R' || record.ocr_status === 'F' || record.ocr_status === 'AF') && (
                <>
                  <Divider type="vertical" />
                  <Popconfirm
                    cancelButtonProps={{ type: 'default' }}
                    cancelText={<FormattedMessage id="component.table.popconfirm.delete.cancel" />}
                    okText={<FormattedMessage id="component.table.popconfirm.delete.ok" />}
                    okButtonProps={{ type: 'danger' }}
                    onConfirm={() => {
                      deleteOCRFileByFileId(record.file_id).then((res) => {
                        Modal.info({
                          title: res.status,
                          content: (
                            <div>
                              {res.message}
                            </div>
                          ),
                          onOk() { location.reload(); return false; },
                        });
                      })
                    }}
                    title={<FormattedMessage id="component.table.popconfirm.delete" />}
                  >
                    <Tooltip placement="topLeft" title="Delete">
                      <DeleteOutlined />
                    </Tooltip>
                  </Popconfirm>
                </>
              )}

              {(record.ocr_status === 'WR' || record.ocr_status === 'R' || record.ocr_status === 'SA' || record.ocr_status === 'AS' || record.ocr_status === 'AF') && (
                <>
                  <Divider type="vertical" />
                  <Tooltip placement="topLeft" title="Export Excel">
                    <FileExcelTwoTone
                      twoToneColor="#29C038"
                      onClick={() => {
                        setLoadingText('Exporting Excel file...');
                        showLoading(true);
                        getOCRFileExportExcelByFileId(record.file_id).then((data) => {
                          const name = record.original_name.substring(0, record.original_name.length - 4);
                          const extension = record.original_name.substring(record.original_name.length - 3, record.original_name.length);
                          const fileName = extension.toUpperCase() === 'PDF' ? name : record.original_name;
                          exportToExcel(data, fileName)
                          showLoading(false);
                        });
                      }}
                    />
                  </Tooltip>
                  <Divider type="vertical" />
                  <Tooltip placement="topLeft" title="Export PDF">
                    <FilePdfTwoTone
                      twoToneColor="#eb2f96"
                      onClick={() => {
                        setLoadingText('Generating PDF file...');
                        showLoading(true);
                        getOCRFileContentByFileId(record.file_id).then((data) => {
                          const name = record.original_name.substring(0, record.original_name.length - 4);
                          const extension = record.original_name.substring(record.original_name.length - 3, record.original_name.length);
                          const fileName = extension.toUpperCase() === 'PDF' ? name : record.original_name;
                          createAndDownloadBlobFile(data, fileName, 'pdf');
                          showLoading(false);
                        });
                      }}
                    />
                  </Tooltip>
                </>
              )}

              {(record.ocr_status === 'R' || record.ocr_status === 'AF') && (
                <>
                  <Divider type="vertical" />
                  <Popconfirm
                    cancelButtonProps={{ type: 'default' }}
                    cancelText={<FormattedMessage id="component.table.popconfirm.submitToAllpay.cancel" />}
                    okText={<FormattedMessage id="component.table.popconfirm.submitToAllpay.ok" />}
                    okButtonProps={{ type: 'danger' }}
                    onConfirm={() => handleSendToAllpay(record.file_id)}
                    title={<FormattedMessage id="component.table.popconfirm.submitToAllpay" />}
                  >
                    <Tooltip placement="topLeft" title="Send To Allpay">
                      <img
                        src={logo}
                        style={{
                          width: '50px',
                          height: 'auto',
                          cursor: 'pointer',
                        }}
                      />
                    </Tooltip>

                  </Popconfirm>
                </>
              )}
            </>
            : null}
        </>
      ),
    },
    {
      title: 'Allpay Doc',
      dataIndex: 'allpay_no',
      sorter: false,
      hideInForm: true,
      width: 140,
      onCell: () => {
        return {
          style: {
            whiteSpace: 'nowrap',
          },
        };
      },
      ...getColumnSearchProps('Allpay Doc', 'allpay_no'),
    },
    {
      title: 'Uploaded By',
      dataIndex: 'create_name',
      sorter: false,
      hideInForm: true,
      width: 150,
      onCell: () => {
        return {
          style: {
            whiteSpace: 'nowrap',
          },
        };
      },
      ...getColumnSearchProps('Uploaded by', 'create_name'),
    },
    {
      title: 'OCR Result',
      dataIndex: 'original_result',
      valueType: 'original_result',
      width: 90,
      onCell: () => {
        return {
          style: {
            textAlign: 'center',
            whiteSpace: 'nowrap',
          },
        };
      },
      render: (_, record) => {
        return (
          <>
            {(record.ocr_status !== 'U' && record.ocr_status !== 'IP' && record.is_delete === "N") && (
              <a onClick={() => {
                Modal.info({
                  title: 'OCR Result',
                  content: (
                    <div>{record.original_result}</div>
                  ),
                  width: 800,
                  mask: true,
                  maskClosable: true,
                  okText: 'Close'
                });
              }}>View</a>
            )}
          </>
        )
      }
    },
    {
      title: 'AllPay Result',
      dataIndex: 'allpay_result_message',
      valueType: 'allpay_result_message',
      width: 120,
      onCell: () => {
        return {
          style: {
            textAlign: 'center',
            whiteSpace: 'nowrap',
          },
        };
      },
      render: (_, record) => {
        return (
          <>
            {(record.ocr_status === 'AF' || record.ocr_status == 'AS' && record.is_delete === "N") && (
              <a onClick={() => {
                Modal.info({
                  title: 'AllPay Result',
                  content: (
                    <div>{record.allpay_result_message}</div>
                  ),
                  width: 800,
                  mask: true,
                  maskClosable: true,
                  okText: 'Close'
                });
              }}>View</a>
            )}
          </>
        )
      }
    },
  ];

  const getDocumentType = () => {
    setFetching(true);

    if (!documentTypeList || documentTypeList.length <= 0) {
      getDocument().then((result) => {
        const documentTypeData = [];
        try {
          result.forEach(r => {
            documentTypeData.push({
              value: r.document_code,
              text: r.document_name,
            });
          });
        } catch (error) {
          console.log(error);
        }
        setDocumentTypeList(documentTypeData);
        setFetching(false);
      });
    }
  }

  const handleDocumentTypeSelect = (value) => {
    form.setFieldsValue({ documentType: value });
    form.setFieldsValue({ vendor: undefined });
    form.setFieldsValue({ additionalInfo: undefined });
    setVendorList([]);
    setAdditionalInfoList([]);
  }

  const getVendor = () => {
    setFetching(true);

    if (!vendorList || vendorList.length <= 0) {
      getVendorByDocumentCode(form.getFieldValue('documentType')).then((result) => {
        const vendorData = [];
        try {
          result.forEach(r => {
            vendorData.push({
              value: r.vendor_code,
              text: r.vendor_code + ' : ' + r.vendor_name,
            });
          });
        } catch (error) {
          console.log(error);
        }
        setVendorList(vendorData);
        setFetching(false);
      });
    }
  }

  const handleVendorSelect = (value) => {
    form.setFieldsValue({ vendor: value });
    form.setFieldsValue({ additionalInfo: undefined });
    setAdditionalInfoList([]);
  }

  const getAdditionalInfo = () => {
    setFetching(true);

    if (!additionalInfoList || additionalInfoList.length <= 0) {
      getAdditionalInfoByDocumentCodeVendorCode(form.getFieldValue('documentType'),
        form.getFieldValue('vendor')).then((result) => {
          const additionalInfoData = [];
          try {
            result.forEach(r => {
              additionalInfoData.push({
                value: r.masterdata_id,
                text: r.additional_info === '' ? ' ' : r.additional_info,
              });
            });
          } catch (error) {
            console.log(error);
          }
          setAdditionalInfoList(additionalInfoData);
          setFetching(false);
        });
    }
  }

  const handleAdditionalInfoSelect = (value) => {
    form.setFieldsValue({ additionalInfo: value });
  }

  const rangeConfig = {
    rules: [
      {
        type: 'array',
        message: 'Please select time!',
      },
    ],
  };

  const onFinish = (fieldsValue, reloading) => {
    // Format date value before search
    const uploadedDate = fieldsValue['uploadedDate'];
    if (uploadedDate) {
      fieldsValue = {
        ...fieldsValue,
        uploadedDateRange: [uploadedDate[0].format('YYYY-MM-DD'), uploadedDate[1].format('YYYY-MM-DD')],
      };
    }

    if(reloading){
      showLoading(true);
    }
    
    // Search by criteria
    getOCRFileList(fieldsValue).then((result) => {
      try {
        setData(result);
        showLoading(false);
      } catch (error) {
        console.log(error)
      }
    });

    getTotalPageExtracted(fieldsValue).then((result) => {
      try {
        if (result.data.length) {
          setTotalPageExtracted(result.data[0].total_page_extracted)
        }
      } catch (error) {
        console.log(error)
      }
    })
  };

  useEffect(() => {
    onFinish(form.getFieldsValue(), true)
    const intervalId = setInterval(() => {
      onFinish(form.getFieldsValue(), false)
    }, INTERVAL_TIME);

  return () => clearInterval(intervalId);
  }, []);

  return (
    <Spin spinning={loading} size="large" tip={loadingText} style={{ marginTop: '50vh' }}>
      {/* Page header */}
      <PageHeaderWrapper />

      {/* Upload Section */}
      <Card
        style={{ marginTop: 16 }}
        title="Upload documents"
      >
        <UploadManually />
      </Card>
      {/* Table Section */}

      <Card
        style={{ marginTop: 16 }}
        title="Search criteria"
        className={styles.searchCriteriaCard}
      >
        <Form
          form={form}
          initialValues={{
            uploadedBy: 'personal'
          }}
          layout="vertical"
          onFinish={(values) => onFinish(values, true)}
          onValuesChange={onUploadedByChange}
        >
          <Row>
            <Col xl={4} lg={10} md={{ span: 11, offset: 1 }} sm={24}>
              <Form.Item
                label="Uploaded by"
                name="uploadedBy"
                required
              >
                <Radio.Group
                  style={{ width: '100%' }}
                >
                  <Radio.Button
                    style={{
                      textAlign: 'center',
                      width: '50%'
                    }}
                    value="personal"
                  >
                    Me
                  </Radio.Button>
                  {userProfile.currentAuthority === 'admin' &&
                    <Radio.Button
                      style={{
                        textAlign: 'center',
                        width: '50%'
                      }}
                      value="all"
                      disabled={userProfile.currentAuthority === 'user'}
                    >
                      Everyone
                    </Radio.Button>
                  }
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xl={{ span: 10, offset: 2 }} lg={{ span: 8 }} md={{ span: 11, offset: 1 }} sm={24}>
              <Form.Item
                label="Uploaded Date"
                name="uploadedDate"
                {...rangeConfig}
              >
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row justify={'space-between'}>
            <Col xl={{ span: 4 }} lg={{ span: 8 }} md={{ span: 11, offset: 1 }} sm={24}>
              <Form.Item
                label="Document type"
                name="documentType"
              >
                <Select
                  allowClear
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  onDropdownVisibleChange={getDocumentType}
                  onChange={handleDocumentTypeSelect}
                  placeholder={<FormattedMessage id="component.selectDocument.placeholder" />}
                  showSearch
                  style={{ width: '100%' }}
                >
                  {documentTypeOptions}
                </Select>
              </Form.Item>
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 11, offset: 1 }} sm={24}>
              <Form.Item
                label="Vendor"
                name="vendor"
              >
                <Select
                  allowClear
                  disabled={!form.getFieldValue('documentType')}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  onDropdownVisibleChange={getVendor}
                  onChange={handleVendorSelect}
                  placeholder={<FormattedMessage id="component.selectVendor.placeholder" />}
                  showSearch
                  style={{ width: '100%' }}
                >
                  {vendorOptions}
                </Select>
              </Form.Item>
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 11, offset: 1 }} sm={24}>
              <Form.Item
                label="Additional info"
                name="additionalInfo"
              >
                <Select
                  allowClear
                  disabled={!form.getFieldValue('documentType') || !form.getFieldValue('vendor')}
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  onDropdownVisibleChange={getAdditionalInfo}
                  onChange={handleAdditionalInfoSelect}
                  placeholder={<FormattedMessage id="component.selectAdditionalInfo.placeholder" />}
                  showSearch
                  style={{ width: '100%' }}
                >
                  {additionalInfoOptions}
                </Select>
              </Form.Item>
            </Col>
            <Col xl={{ span: 4, offset: 2 }} lg={{ span: 8 }} md={{ span: 11, offset: 1 }} sm={24}>
              <Form.Item
                label="Deleted"
                name="is_delete"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col
              xl={{ span: 16 }}
              lg={{ span: 8 }}
              md={{ span: 12 }}
              sm={24}
              style={{
                textAlign: 'right',
              }}
            >
              <Button
                htmlType="submit"
                style={{
                  margin: '0 8px',
                }}
                type="primary"
                shape="round"
              >
                Search
              </Button>
              <Button
                shape="round"
                onClick={() => {
                  form.resetFields();
                  form.setFieldsValue({ uploadedBy: 'personal' });
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title="Document list"
        extra={<span style={{ float: 'right', textAlign: 'right' }} >Total Pages Extracted: <span style={{ marginLeft: '2%', float: 'right', textAlign: 'right' }} ></span>{totalPageExtracted}</span>}
      >
        <Row>
          <Col
            span={24}
            style={{
              textAlign: 'right',
            }}
          >
            <Popconfirm
              disabled={selectedRowKeys.length < 1}
              cancelButtonProps={{ type: 'default' }}
              cancelText={<FormattedMessage id="component.table.popconfirm.delete.cancel" />}
              okText={<FormattedMessage id="component.table.popconfirm.delete.ok" />}
              okButtonProps={{ type: 'danger' }}
              onConfirm={() => {
                deleteMultipleOCRFilesByFileId(selectedRowKeys).then((res) => {
                  Modal.info({
                    title: res.status,
                    content: (
                      <div>
                        {res.message}
                      </div>
                    ),
                    onOk() { location.reload(); return false; },
                  });
                })
              }}
              title={<FormattedMessage id="component.table.deleteAll.delete" />}
            >
              <Button
                disabled={selectedRowKeys.length < 1}
                type="primary"
                shape="round"
                style={{
                  marginLeft: 24,
                  marginBottom: 16,
                }}
              >
                {<FormattedMessage id="component.table.deleteAll" />}
              </Button>
            </Popconfirm>
            <Popconfirm
              disabled={selectedRowKeys.length < 1}
              cancelButtonProps={{ type: 'default' }}
              cancelText={<FormattedMessage id="component.table.popconfirm.exportExcelAll.cancel" />}
              okText={<FormattedMessage id="component.table.popconfirm.exportExcelAll.ok" />}
              okButtonProps={{ type: 'danger' }}
              onConfirm={handleExportExcelAll}
              title={<FormattedMessage id="component.table.exportExcelAll.submit" />}
            >
              <Button
                disabled={selectedRowKeys.length < 1}
                type="primary"
                shape="round"
                style={selectedRowKeys.length < 1 ?
                  {
                    marginLeft: 24,
                    marginBottom: 16,
                  }
                  : {
                    backgroundColor: "#33cc00",
                    borderColor: "#33cc00",
                    marginLeft: 24,
                    marginBottom: 16,
                  }}
              >
                {<FormattedMessage id="component.table.exportExcelAll" />}
              </Button>
            </Popconfirm>
            <Popconfirm
              disabled={selectedRowKeys.length < 1}
              cancelButtonProps={{ type: 'default' }}
              cancelText={<FormattedMessage id="component.table.popconfirm.submitToAllpay.cancel" />}
              okText={<FormattedMessage id="component.table.popconfirm.submitToAllpay.ok" />}
              okButtonProps={{ type: 'danger' }}
              onConfirm={handleSendToAllpayMultiple}
              title={<FormattedMessage id="component.table.submitAllToAllpay.submit" />}
            >
              <Button
                disabled={selectedRowKeys.length < 1}
                type="primary"
                shape="round"
                style={selectedRowKeys.length < 1 ?
                  {
                    marginLeft: 24,
                    marginBottom: 16,
                  }
                  : {
                    backgroundColor: "#0aafef",
                    borderColor: "#0aafef",
                    marginLeft: 24,
                    marginBottom: 16,
                  }}
              >
                {<FormattedMessage id="component.table.submitAllToAllpay" />}
              </Button>
            </Popconfirm>
          </Col>
        </Row>
        <IntlProvider value={enUSIntl}>
          <ProTable
            actionRef={actionRef}
            columns={columns}
            dataSource={loading ? null : data}
            dateFormatter="DD/MM/YYYY HH:mm:ss"
            loading={loading}
            onChange={(_, _filter, _sorter) => {
              const sorterResult = _sorter;
              if (sorterResult.field && sorterResult.order) {
                setSorter(sorterResult.order.substring(0, 4));
              }
            }}
            pagination={{
              defaultPageSize: 10,
              showTitle: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} of total ${total} items`,
            }}
            params={{
              sorter,
            }}
            rowKey={'file_id'}
            rowSelection={rowSelection}
            scroll={{ x: 'max-content' }}
            search={false}
            toolBarRender={false}
          />
        </IntlProvider>
      </Card>

      {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value);

            if (success) {
              handleUpdateModalVisible(false);
              setStepFormValues({});

              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={stepFormValues}
        />
      ) : null}
    </Spin>
  );
};

export default TableList;
