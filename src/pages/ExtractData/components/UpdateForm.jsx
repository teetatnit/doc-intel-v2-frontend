/*
Creator:            Chanakan C.
Creation date:      5/May/2021
*/

import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Form, Input, Modal, message, Spin, Tooltip, Upload } from 'antd';
import { FormattedMessage } from 'umi';
import { Document, Page, View } from 'react-pdf'
import { ZoomInOutlined, ZoomOutOutlined, EditOutlined, LeftOutlined, RightOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import AllpayFieldTable from '../AllpayFieldTable';
import { createAttachFile, createReceiptFile, createSupportingDocFile, getOCRFileContentByFileId, updateFieldsByFileId, getAttachFileByFileId, getReceiptFileByFileId, getSupportingDocFileByFileId, updateAttachFile, updateReceiptFile, updateSupportingDocFile, getOCRFileById } from '../service';
import { getPaymentLocationsListByPaymentTypeCodeCompanyCode } from '@/services/paymentLocation';
import reqwest from 'reqwest';
import fieldName from '@/utils/fieldName';

import styles from './UpdateForm.less';

const filesize = require('filesize');

const UpdateForm = props => {
  const [fileData, setFileData] = useState("");
  const [formVals, setFormVals] = useState({
    file_id: props.values.file_id,
    company_id: props.values.company_id,
    masterdata_id: props.values.masterdata_id,
    original_result: props.values.original_result,
    modify_result: props.values.modify_result,
    fields: [],
    day_auto_duedate: props.values.day_auto_duedate,
    ocr_status: props.values.ocr_status,
    loading: false
  });
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [paymentLocation, setPaymentLocation] = useState([]);

  const [form] = Form.useForm();

  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
  } = props;

  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window
    return { width, height }
  }

  const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

    useEffect(() => {
      const handleResize = () => setWindowDimensions(getWindowDimensions())
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
  }

  const { width, height } = useWindowDimensions();

  const onClickSave = async () => {
    setSaving(true);
    const hide = message.loading('Updating information...');
    try {
      await updateFieldsByFileId(formVals.file_id, formVals.fields)
      await deleteAttachFile();
      await uploadAttachFile();

      await deleteReceiptFile();
      await uploadReceiptFile();

      await deleteSupportingDocFile();
      await uploadSupportingDocFile();

      setSaving(false);
      hide();
      message.success('Success');
      handleUpdateModalVisible();
      // setEditing(false);
      return true;
    } catch (error) {
      hide();
      message.error('Failed', error);
      return false;
    }
  };

  function isNumber(n) {
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
  }

  function NewlineText(props) {
    const text = props.text;
    return text.split('\n').map(str => <p>{str}</p>);
  }

  const validateValue = async (fields, status) => {
    var errorMessage = '';
    if (!(status === 'AF' || status === 'R')) {
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
            if (item.display_name === fieldName.paymentType && (item.ocr_result !== '' || item.ocr_result !== undefined || item.ocr_result === 'undefined' || item.ocr_result !== null)) {
              var count = 0
              paymentLocation.forEach(function (p) {
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
            }
            /*
            if (item.display_name === fieldName.currency && (item.ocr_result !== '' && item.ocr_result !== undefined && item.ocr_result !== null)) {
              const indexExchangeRate = fields.findIndex(item => item.display_name === fieldName.exchangeRate);
              if (indexExchangeRate === -1) {
                if (item.ocr_result !== 'THB') {
                  errorMessage = errorMessage + 'Not found ' + fieldName.exchangeRate +'.' + '\n';
                }
              } else {
                const valueExchangeRate = fields[indexExchangeRate].ocr_result;
                if (valueExchangeRate === '' || valueExchangeRate === undefined || valueExchangeRate === null) {
                  errorMessage = errorMessage +'Input ' + fieldName.exchangeRate + '.' + '\n';
                }
              } 
            }
            */

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

  const handleNext = async () => {
    setSubmitting(true);
    const hide = message.loading('Updating information...');
    try {
      await updateFieldsByFileId(formVals.file_id, formVals.fields)
      await deleteAttachFile();
      await uploadAttachFile();

      await deleteReceiptFile();
      await uploadReceiptFile();

      await deleteSupportingDocFile();
      await uploadSupportingDocFile();
      
      var fileData = await getOCRFileById(formVals.file_id);
      hide();
      validateValue(formVals.fields, fileData.data.ocr_status).then((data) => {
        if (data.isError) {
          Modal.error({
            title: 'Error',
            content: <NewlineText text={data.errorMessage} />,
          });
          setSubmitting(false);
          return;
        } else {
          const indexCreator = formVals.fields.findIndex(item => item.display_name === fieldName.creator);
          const indexCreateDate = formVals.fields.findIndex(item => item.display_name === fieldName.createDate);
          if (indexCreator !== -1) {
            formVals.fields[indexCreator].ocr_result = '';
          }
          if (indexCreateDate !== -1) {
            formVals.fields[indexCreateDate].ocr_result = '';
          }
          setFormVals({ ...formVals, ...formVals });
          handleUpdate({ ...formVals, ...formVals });
          setSubmitting(false);
        }
      });
    } catch (error) {
      hide();
      Modal.error({
        title: 'Error',
        content: `Failed to Submit to Allpay. Reason: ${error}.`,
      });
      setSubmitting(false);
      return;
    }
  };

  const renderFooter = () => {
    return (
      <>
        <div style={{ display: "flex" }}>
          {(props.values.ocr_status === 'WR' || props.values.ocr_status === 'R' || props.values.ocr_status === 'AF') ?
            (
              <>
                <Button
                  disabled={formVals.loading}
                  type="primary"
                  shape="round"
                  onClick={onClickSave}
                  loading={saving}
                  style={formVals.loading ?
                    { marginLeft: "auto", }
                    : {
                      marginLeft: "auto",
                    }}
                >
                  {saving ? 'Saving' : 'Save'}
                </Button>
                <Button
                  disabled={formVals.loading}
                  type="primary"
                  shape="round"
                  onClick={() => handleNext()}
                  style={formVals.loading ?
                    {}
                    : {
                      backgroundColor: "#33cc00",
                      borderColor: "#33cc00",
                    }}
                >
                  {submitting ? 'Submitting to Allpay' : <FormattedMessage id="page.modal.submitToAllpay" />}
                </Button>
              </>
            ) : null
          }
        </div>
      </>
    );
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onSourceError(err) {
    console.log("On source error : ", err)
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function changeZoomLevel(offset) {
    setZoomLevel(prevZoomLevel => prevZoomLevel + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomOut() {
    changeZoomLevel(-0.25);
  }

  function zoomIn() {
    changeZoomLevel(0.25);
  }

  const [fileList, setFileList] = useState([]);
  const [deleteFileList, setDeleteFileList] = useState([]);

  const [receiptFileList, setReceiptFileList] = useState([]);
  const [deleteReceiptFileList, setDeleteReceiptFileList] = useState([]);

  const [supportingDocfileList, setSupportingDocFileList] = useState([]);
  const [deleteSupportingDocFileList, setDeleteSupportingDocFileList] = useState([]);

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const uploadAttachFileprops = {
    onRemove: file => {
      const index = fileList.indexOf(file);
      setDeleteFileList([...deleteFileList, file]);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: file => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File size must smaller than 10 MB!');
      } else {
        setFileList([...fileList, file]);
      }
      return false;
    },
    fileList: fileList,
  };

  const uploadReceiptFileprops = {
    onRemove: file => {
      const index = receiptFileList.indexOf(file);
      setDeleteReceiptFileList([...deleteReceiptFileList, file]);
      const newFileList = receiptFileList.slice();
      newFileList.splice(index, 1);
      setReceiptFileList(newFileList);
    },
    beforeUpload: file => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File size must smaller than 10 MB!');
      } else {
        setReceiptFileList([...receiptFileList, file]);
      }
      return false;
    },
    fileList: receiptFileList,
  };

  const uploadSupportingDocFileprops = {
    onRemove: file => {
      const index = supportingDocfileList.indexOf(file);
      setDeleteSupportingDocFileList([...deleteSupportingDocFileList, file]);
      const newFileList = supportingDocfileList.slice();
      newFileList.splice(index, 1);
      setSupportingDocFileList(newFileList);
    },
    beforeUpload: file => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File size must smaller than 10 MB!');
      } else {
        setSupportingDocFileList([...supportingDocfileList, file]);
      }
      return false;
    },
    fileList: supportingDocfileList,
  };


  const uploadAttachFile = () => {
    const formData = new FormData();
    fileList.forEach(file => {
      if (file.status !== 'done') {
        formData.set('file', file);
        reqwest({
          url: `${API_URL}/uploadocr`,
          method: 'post',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          processData: false,
          data: formData,
          success: (data) => {
            const fileSize = filesize(file.size, { base: 2 });
            createAttachFile(data.original_name, fileSize, data.localpath, data.fullPath, formVals.file_id).then((res) => {
              setFileList([]);
            })
          },
          error: () => {
            message.error('Upload failed.');
          },
        });
      }
    });
  };

  const uploadReceiptFile = () => {
    const formData = new FormData();
    receiptFileList.forEach(file => {
      if (file.status !== 'done') {
        formData.set('file', file);
        reqwest({
          url: `${API_URL}/uploadocr`,
          method: 'post',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          processData: false,
          data: formData,
          success: (data) => {
            const fileSize = filesize(file.size, { base: 2 });
            createReceiptFile(data.original_name, fileSize, data.localpath, data.fullPath, formVals.file_id).then((res) => {
              setReceiptFileList([]);
            })
          },
          error: () => {
            message.error('Upload failed.');
          },
        });
      }
    });
  };

  const uploadSupportingDocFile = () => {
    const formData = new FormData();
    supportingDocfileList.forEach(file => {
      if (file.status !== 'done') {
        formData.set('file', file);
        reqwest({
          url: `${API_URL}/uploadocr`,
          method: 'post',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          processData: false,
          data: formData,
          success: (data) => {
            const fileSize = filesize(file.size, { base: 2 });
            createSupportingDocFile(data.original_name, fileSize, data.localpath, data.fullPath, formVals.file_id).then((res) => {
              setSupportingDocFileList([]);
            })
          },
          error: () => {
            message.error('Upload failed.');
          },
        });
      }
    });
  };

  const deleteAttachFile = () => {
    const formData = new FormData();
    deleteFileList.forEach(file => {
      formData.set('file', file);
      updateAttachFile(formVals.file_id, Number(file.uid)).then((res) => {
      })
    });
    setDeleteFileList([]);
  };

  const deleteReceiptFile = () => {
    const formData = new FormData();
    deleteReceiptFileList.forEach(file => {
      formData.set('file', file);
      updateReceiptFile(formVals.file_id, Number(file.uid)).then((res) => {
      })
    });
    setDeleteReceiptFileList([]);
  };

  const deleteSupportingDocFile = () => {
    const formData = new FormData();
    deleteSupportingDocFileList.forEach(file => {
      formData.set('file', file);
      updateSupportingDocFile(formVals.file_id, Number(file.uid)).then((res) => {
      })
    });
    setDeleteSupportingDocFileList([]);
  };

  // Similar to componentDidMount and componentDidUpdate
  useEffect(() => {
    if (!fileData) {
      getOCRFileContentByFileId(formVals.file_id).then((data) => {
        setFileData(data);
      });
    }

    getAttachFileByFileId(formVals.file_id).then((data) => {
      setFileList(data);
    });

    getReceiptFileByFileId(formVals.file_id).then((data) => {
      setReceiptFileList(data);
    });

    getSupportingDocFileByFileId(formVals.file_id).then((data) => {
      setSupportingDocFileList(data);
    });

    const fields = formVals.fields;

    // Payment Type
    const indexPaymemtType = fields.findIndex(data => data.display_name === fieldName.paymentType);
    const paymentType = indexPaymemtType === -1 ? undefined : refieldssponse[indexPaymemtType].ocr_result;

    // Comapny
    const indexCompany = fields.findIndex(data => data.display_name === fieldName.company);
    const company_code = indexCompany === -1 ? undefined : fields[indexCompany].ocr_result;

    if (paymentType === undefined || paymentType === '' || company_code === undefined || company_code === '') {
      setPaymentLocation([]);
    } else {
      getPaymentLocationsListByPaymentTypeCodeCompanyCode(paymentType, company_code).then((data) => {
        setPaymentLocation(data);
      });
    }

  }, []);

  return (
    <Modal
      className={styles.modal}
      style={{
        top: 10,
        width: (90 * width / 100),
        minWidth: (90 * width / 100),
        height: (75 * height / 100),
        minHeight: (75 * height / 100)
      }}
      bodyStyle={{
        padding: '10px',
      }}
      destroyOnClose
      maskClosable={false}
      title={<FormattedMessage id="page.modal.title" />}
      visible={updateModalVisible}
      footer={renderFooter()}
      onCancel={() => handleUpdateModalVisible()}
    >
      <Row>
        <Col span={12}>
          {/* <h3 style={{textAlign: 'center'}}>Original document</h3>*/}
          <div style={{ maxHeight: (70 * height / 100), overflowY: "auto", marginBottom: '10px' }} >
            <Document
              file={{ data: fileData }}
              loading={<center><Spin tip="Loading PDF File..." /></center>}
              renderMode='canvas'
              onLoadSuccess={onDocumentLoadSuccess}
              onSourceError={onSourceError}
              size='A4'
            >
              <Page
                pageNumber={pageNumber}
                scale={zoomLevel}
              />
            </Document>
          </div>
        </Col>
        <Col span={12}>
          <div className="AllpayFieldTable" style={{ maxHeight: (70 * height / 100) }}>
            <AllpayFieldTable values={formVals} />
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <div style={{ textAlign: 'center' }}>
            <div className={styles.pdfController}>
              <Tooltip title="Zoom In" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
                <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
              </Tooltip>
              <Tooltip title="Zoom Out" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
                <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
              </Tooltip>
              <Tooltip title="Previous Page" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
                <Button icon={<LeftOutlined />} onClick={previousPage} disabled={pageNumber === 1} />
              </Tooltip>
              <span className={styles.pageNo}>Page {pageNumber} of {numPages}</span>
              <Tooltip title="Next Page" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
                <Button icon={<RightOutlined />} onClick={nextPage} disabled={pageNumber === numPages} />
              </Tooltip>
            </div>
          </div>
        </Col>
        <Col span={12}>
          {(props.values.ocr_status === 'WR' || props.values.ocr_status === 'R') ?
            (
              <>
                <Upload style={{ marginTop: 10 }} {...uploadAttachFileprops}>
                  <Button style={{ width: '100%' }} icon={<UploadOutlined />}>Click to upload Tax Invoice/Invoice Credit/Debit Note</Button>
                </Upload>
              </>
            ) : null
          }
          {(props.values.ocr_status === 'WR' || props.values.ocr_status === 'R') ?
            (
              <>
                <Upload style={{ marginTop: 10 }} {...uploadReceiptFileprops}>
                  <Button style={{ width: '100%' }} icon={<UploadOutlined />}>Click to upload receipt</Button>
                </Upload>
              </>
            ) : null
          }
          {(props.values.ocr_status === 'WR' || props.values.ocr_status === 'R') ?
            (
              <>
                <Upload style={{ marginTop: 10 }} {...uploadSupportingDocFileprops}>
                  <Button style={{ width: '100%' }} icon={<UploadOutlined />}>Click to upload supporting Doc</Button>
                </Upload>
              </>
            ) : null
          }
        </Col>
      </Row>
    </Modal>
  );
};

export default UpdateForm;
