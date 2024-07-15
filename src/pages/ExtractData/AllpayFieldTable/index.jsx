import React, { useState, useEffect } from 'react';
import { Checkbox, DatePicker, Form, Input, InputNumber, Select, Spin, Switch, Table } from 'antd';
import { useIntl } from 'umi';
import styles from './index.less';
import fieldName from '@/utils/fieldName';
import moment from 'moment';
import { getOCRResultByFileId } from '../service';
import { getFormTypesList } from '@/services/formType';
import { getCompaniesOptionList } from '@/services/company';
import { getStatusList } from '@/services/status';
import { getPaymentTypesListByCompanyCode } from '@/services/paymentType';
import { getPaymentLocationsListByPaymentTypeCodeCompanyCode } from '@/services/paymentLocation';
import { getGRApprovalForsListByCompanyCode } from '@/services/grApprovalFor';
import { getCurrenciesList } from '@/services/currency';
import {
  getApproversGdcByStartWithName,
  getApproversGdcByAdAccount,
  getApproversDbByStartWithName,
  getApproversDbByStartWithEmail,
} from '@/services/approver';
import { getReviewersDbByStartWithName, getReviewersDbByStartWithEmail } from '@/services/reviewer';
import {
  getRequestersDbByStartWithName,
  getRequestersDbByStartWithEmail,
} from '@/services/requester';
import { getVendorsList } from '@/services/vendor';
import { getBeneficiariesListByVendorCode } from '@/services/beneficiary';
import { getRemittedCurrenciesList } from '@/services/remittedCurrency';
import { getPaidForsList } from '@/services/paidFor';
import { getPreAdvicesList } from '@/services/preAdvice';
import { getServiceTeamsList } from '@/services/serviceTeam';
import { getDocumentTypeList } from '@/services/documentType';
import { getTaxRatesList } from '@/services/taxRate';
import { getWhtRatesList } from '@/services/whtRate';
import { getExpensesList } from '@/services/expense';
import { getCostCentersList } from '@/services/costcenter';
import { getInternalOrdersList } from '@/services/internalOrder';
import { getBankChargesList } from '@/services/bankCharge';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

const { Option } = Select;

const EditableTable = (props) => {
  // Set of props
  const day_auto_duedate = props.values.day_auto_duedate;
  const fileId = props.values.file_id;
  const isEditing =
    props.values.ocr_status === 'WR' ||
    props.values.ocr_status === 'R' ||
    props.values.ocr_status === 'AF'
      ? true
      : false;

  // Common object
  const [form] = Form.useForm();
  const intl = useIntl();
  const [data, setData] = useState([]);
  const [fetching, setFetching] = useState();
  const [loading, setLoading] = useState(true);

  const dateFormat = 'DD/MM/YYYY';
  const fieldList = {
    fieldTypeDt: 'DT',
    fieldTypeD: 'D',
    fieldTypeB: 'B',
    is_display: true,
  };

  // Set of master data
  const [formType, setFormType] = useState([]);
  const [company, setCompany] = useState([]);
  const [status, setStatus] = useState([]);
  const [paymentType, setPaymentType] = useState([]);
  const [paymentLocation, setPaymentLocation] = useState([]);
  const [grApprovalFor, setGrApprovalFor] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [creator, setCreator] = useState([]);
  const [requestor, setRequestor] = useState([]);
  const [reviewer, setReviewer] = useState([]);
  const [cc, setCC] = useState([]);
  const [approver, setApprover] = useState([]);
  const [alternativePayeeVendor, setAlternativePayeeVendor] = useState([]);
  const [beneficiary, setBeneficiary] = useState([]);
  const [remittedCurrency, setRemittedCurrency] = useState([]);
  const [paidFor, setPaidFor] = useState([]);
  const [preAdvice, setPreAdvice] = useState([]);
  const [bankCharge, setBankCharge] = useState([]);
  const [serviceTeam, setServiceTeam] = useState([]);
  const [documentType, setDocumentType] = useState([]);
  const [vatRate, setVatRate] = useState([]);
  const [whtRate, setWhtRate] = useState([]);
  const [expenseCode, setExpenseCode] = useState([]);
  const [costCenter, setCostCenter] = useState([]);
  const [internalOrderNo, setInternalOrderNo] = useState([]);



  const calculateAlternativePayeeAmount = (data) =>{
    const newData = [...data];
    var amountExcludeVat = 0;
    var vatBaseTotalAmount = 0;
    var vatRateCode = 0;
    var whtBaseTotalAmount = 0;
    var whtRateCode = 0;
    var wht2BaseTotalAmount = 0;
    var wht2RateCode = 0;
    var wht3BaseTotalAmount = 0;
    var wht3RateCode = 0;
    var wht4BaseTotalAmount = 0;
    var wht4RateCode = 0;
    var wht5BaseTotalAmount = 0;
    var wht5RateCode = 0;
    
    for (let idx = 0; idx < newData.length; idx++) {
      if (newData[idx].display_name === 'Amount (Exclude Vat.)') {
        amountExcludeVat = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'VAT Base Total Amount') {
        vatBaseTotalAmount = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'VAT Rate') {
        vatRateCode = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'WHT Base Total Amount') {
        whtBaseTotalAmount = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'WHT 2 Base Total Amount') {
        wht2BaseTotalAmount = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'WHT 3 Base Total Amount') {
        wht3BaseTotalAmount = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'WHT 4 Base Total Amount') {
        wht4BaseTotalAmount = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'WHT 5 Base Total Amount') {
        wht5BaseTotalAmount = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'WHT Rate') {
        whtRateCode = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'WHT 2 Rate') {
        wht2RateCode = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'WHT 3 Rate') {
        wht3RateCode = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'WHT 4 Rate') {
        wht4RateCode = parseFloat(newData[idx].ocr_result);
      } else if (newData[idx].display_name === 'WHT 5 Rate') {
        wht5RateCode = parseFloat(newData[idx].ocr_result);
      }
    }

    var vatAmount = vatBaseTotalAmount * (vatRateCode === 0 ? 0 : vatRateCode / 100);

    var whtAmount = calculateWhtAmount(whtBaseTotalAmount, whtRateCode)
    var wht2Amount = calculateWhtAmount(wht2BaseTotalAmount, wht2RateCode)
    var wht3Amount = calculateWhtAmount(wht3BaseTotalAmount, wht3RateCode)
    var wht4Amount = calculateWhtAmount(wht4BaseTotalAmount, wht4RateCode)
    var wht5Amount = calculateWhtAmount(wht5BaseTotalAmount, wht5RateCode)

    
    var alternativePayeeAmount = amountExcludeVat + vatAmount - (whtAmount + wht2Amount + wht3Amount + wht4Amount + wht5Amount);

    // change value Vat Amount & WHT Amount - start
    const indexVatAmount = newData.findIndex((item) => item.display_name === fieldName.vatAmount);
    newData[indexVatAmount].ocr_result = isNaN(vatAmount) ? 0 : vatAmount.toFixed(3)

    const indexAmountIncludeVat = newData.findIndex((item) => item.display_name === fieldName.amountIncludeVat);
    newData[indexAmountIncludeVat].ocr_result = isNaN(amountExcludeVat) ? vatAmount.toFixed(3) : isNaN(amountExcludeVat + vatAmount) ? 0 : (amountExcludeVat + vatAmount).toFixed(3)

    const indexWhtAmount = newData.findIndex((item) => item.display_name === fieldName.whtAmount);
    newData[indexWhtAmount].ocr_result = isNaN(whtAmount) ? 0 : whtAmount.toFixed(3);
    
    // change value Vat Amount & WHT Amount - end


    for (let idx = 0; idx < newData.length; idx++) {
      if (newData[idx].display_name === 'Alternative Payee Amount') {
        newData[idx].ocr_result = isNaN(alternativePayeeAmount) ? 0 : alternativePayeeAmount;
        break;
      }
    }
    return newData;
  }

  const calculateWhtAmount = (whtBaseTotalAmount, whtRateCode) =>{
    const whtAmount = whtBaseTotalAmount * (whtRateCode === 0 ? 0 : whtRateCode / 100);
    return whtAmount
  }

  const onDatePickerChange = (index) => (e) => {
    const newData = [...data];
    if (e) {
      var dateStr = moment(e).format(dateFormat);
      var date = moment(dateStr, 'DD/MM/YYYY', true).isValid()
        ? moment(dateStr, 'DD/MM/YYYY')
        : moment(Date.parse(dateStr));
      var formatDate = date !== '' ? date.format('YYYY-MM-DDTHH:mm:ssZ') : '';
      newData[index].ocr_result = formatDate;
    } else {
      newData[index].ocr_result = '';
    }
    setData(newData);
    props.values.fields = data;
  };

  const onInputNumberChange = (index) => (e) => {
    let newData = [...data];
    if (e) {
      newData[index].ocr_result = e;
    } else {
      newData[index].ocr_result = '';
    }
    if (
      newData[index].display_name === 'Amount (Exclude Vat.)' ||
      newData[index].display_name === 'VAT Base Total Amount' ||
      newData[index].display_name === 'WHT Base Total Amount' ||
      newData[index].display_name === 'WHT 2 Base Total Amount' ||
      newData[index].display_name === 'WHT 3 Base Total Amount' ||
      newData[index].display_name === 'WHT 4 Base Total Amount' ||
      newData[index].display_name === 'WHT 5 Base Total Amount' 
    ) {
      newData = calculateAlternativePayeeAmount(newData)
    }

    if (newData[index].display_name.match(/^Amount [1-5]/g)) {
      var totalAmount = 0;
      newData.forEach((e, idx) => {
        if (e.display_name.match(/^Amount [1-5]/g)) {
          totalAmount = totalAmount + (e.ocr_result !== '' ? parseFloat(e.ocr_result) : 0);
        } else if (e.display_name === 'Amount (Exclude Vat.)') {
          newData[idx].ocr_result = totalAmount;
        }
      });
    } else if (newData[index].display_name.match(/^VAT Base Amount [1-5]/g)) {
      var totalAmount = 0;
      newData.forEach((e, idx) => {
        if (e.display_name.match(/^VAT Base Amount [1-5]/g)) {
          totalAmount = totalAmount + (e.ocr_result !== '' ? parseFloat(e.ocr_result) : 0);
        } else if (e.display_name === 'VAT Base Total Amount') {
          newData[idx].ocr_result = totalAmount;
        }
      });
    } else if (newData[index].display_name.match(/^WHT Base Amount [1-5]/g)) {
      var totalAmount = 0;
      newData.forEach((e, idx) => {
        if (e.display_name.match(/^WHT Base Amount [1-5]/g)) {
          totalAmount = totalAmount + (e.ocr_result !== '' ? parseFloat(e.ocr_result) : 0);
        } else if (e.display_name === 'WHT Base Total Amount') {
          newData[idx].ocr_result = totalAmount;
        }
      });
    } else if (newData[index].display_name.match(/^WHT 2 Base Amount [1-5]/g)) {
      var totalAmount = 0;
      newData.forEach((e, idx) => {
        if (e.display_name.match(/^WHT 2 Base Amount [1-5]/g)) {
          totalAmount = totalAmount + (e.ocr_result !== '' ? parseFloat(e.ocr_result) : 0);
        } else if (e.display_name === 'WHT 2 Base Total Amount') {
          newData[idx].ocr_result = totalAmount;
        }
      });
    } else if (newData[index].display_name.match(/^WHT 3 Base Amount [1-5]/g)) {
      var totalAmount = 0;
      newData.forEach((e, idx) => {
        if (e.display_name.match(/^WHT 3 Base Amount [1-5]/g)) {
          totalAmount = totalAmount + (e.ocr_result !== '' ? parseFloat(e.ocr_result) : 0);
        } else if (e.display_name === 'WHT 3 Base Total Amount') {
          newData[idx].ocr_result = totalAmount;
        }
      });
    } else if (newData[index].display_name.match(/^WHT 4 Base Amount [1-5]/g)) {
      var totalAmount = 0;
      newData.forEach((e, idx) => {
        if (e.display_name.match(/^WHT 4 Base Amount [1-5]/g)) {
          totalAmount = totalAmount + (e.ocr_result !== '' ? parseFloat(e.ocr_result) : 0);
        } else if (e.display_name === 'WHT 4 Base Total Amount') {
          newData[idx].ocr_result = totalAmount;
        }
      });
    } else if (newData[index].display_name.match(/^WHT 5 Base Amount [1-5]/g)) {
      var totalAmount = 0;
      newData.forEach((e, idx) => {
        if (e.display_name.match(/^WHT 5 Base Amount [1-5]/g)) {
          totalAmount = totalAmount + (e.ocr_result !== '' ? parseFloat(e.ocr_result) : 0);
        } else if (e.display_name === 'WHT 5 Base Total Amount') {
          newData[idx].ocr_result = totalAmount;
        }
      });
    }

    setData(newData);
    props.values.fields = data;
  };

  const onSwitchChange = (index) => (e) => {
    const newData = [...data];
    newData[index].ocr_result = e;
    setData(newData);
    props.values.fields = data;
  };

  const onInputChange = (index) => (e) => {
    const newData = [...data];
    if (e.target.value) {
      newData[index].ocr_result = e.target.value;
    } else {
      newData[index].ocr_result = '';
    }
    setData(newData);
    props.values.fields = data;
  };

  const onSelectChange = (index) => (e) => {
    const newData = [...data];
    newData[index].ocr_result = e;
    setData(newData);
    props.values.fields = data;
  };

  // On Select Company
  const onSelectCompany = (index) => (e) => {
    setFetching(true);
    setGrApprovalFor([]);
    setPaymentType([]);
    setPaymentLocation([]);
    const newData = [...data];
    newData[index].ocr_result = e;

    // GR Approval For
    const indexGrApprovalFor = newData.findIndex(
      (item) => item.display_name === fieldName.grApprovalFor,
    );
    if (indexGrApprovalFor !== -1) {
      newData[indexGrApprovalFor].ocr_result = '';
    }

    // Payment Type
    const indexPaymentType = newData.findIndex(
      (item) => item.display_name === fieldName.paymentType,
    );
    if (indexPaymentType !== -1) {
      newData[indexPaymentType].ocr_result = '';
    }

    // Payment Location
    const indexPaymentLocation = newData.findIndex(
      (item) => item.display_name === fieldName.paymentLocation,
    );
    if (indexPaymentLocation !== -1) {
      newData[indexPaymentLocation].ocr_result = '';
    }

    setData(newData);
    props.values.fields = data;

    if (e === undefined) {
      setFetching(false);
    } else {
      getGRApprovalForsListByCompanyCode(e).then((result) => {
        setGrApprovalFor(result);
      });

      getPaymentTypesListByCompanyCode(e).then((data) => {
        setPaymentType(data);
        setFetching(false);
      });
    }
  };

  // On Select Payment Type
  const onSelectPaymentType = (index) => (e) => {
    setFetching(true);
    setPaymentLocation([]);
    const newData = [...data];
    newData[index].ocr_result = e;

    // Payment Location
    const indexPaymentLocation = newData.findIndex(
      (item) => item.display_name === fieldName.paymentLocation,
    );
    if (indexPaymentLocation !== -1) {
      newData[indexPaymentLocation].ocr_result = '';
    }

    // Company
    var company_code = undefined;
    const indexCompanyCode = newData.findIndex((item) => item.display_name === fieldName.company);
    if (indexCompanyCode !== -1) {
      company_code = newData[indexCompanyCode].ocr_result;
    }

    setData(newData);
    props.values.fields = data;

    if (e === undefined || company_code === undefined) {
      setFetching(false);
    } else {
      getPaymentLocationsListByPaymentTypeCodeCompanyCode(e, company_code).then((data) => {
        setPaymentLocation(data);
        setFetching(false);
      });
    }
  };

  // On search requester
  const onRequestorSearch = (value) => {
    setRequestor([]);
    if (value) {
      if (value.length > 2) {
        if (userProfile.bu === 'SCGC') {
          fetch(value, (data) => setRequestor(data));
        } else {
          fetchDbRequester(value, (data) => setRequestor(data));
        }
      }
    }
  };

  // On search reviewer
  const onReviewerSearch = (value) => {
    setReviewer([]);
    if (value) {
      if (value.length > 2) {
        if (userProfile.bu === 'SCGC') {
          fetch(value, (data) => setReviewer(data));
        } else {
          fetchDbReviewer(value, (data) => setReviewer(data));
        }
      }
    }
  };

  // On search cc
  const onCCSearch = (value) => {
    setCC([]);
    if (value) {
      if (value.length > 2) {
        if (userProfile.bu === 'SCGC') {
          fetch(value, (data) => setCC(data));
        } else {
          fetchDbReviewer(value, (data) => setCC(data));
        }
      }
    }
  };

  // On search approver
  const onApproverSearch = (value) => {
    setApprover([]);
    if (value) {
      if (value.length > 2) {
        if (userProfile.bu === 'SCGC') {
          fetch(value, (data) => setApprover(data));
        } else {
          fetchDbApprover(value, (data) => setApprover(data));
        }
      }
    }
  };

  const onSelectVatRateChange = (index) => (e) => {
    let newData = [...data];
    e = e === null ? 0 : e;
    newData[index].ocr_result = `${e}`;

    newData = calculateAlternativePayeeAmount(newData)

    const indexVatBaseTotalAmount = newData.findIndex(
      (item) => item.display_name === fieldName.vatBaseTotalAmount,
    );
    if (indexVatBaseTotalAmount !== -1) {
      if (e === null || e === 0) {
        newData[indexVatBaseTotalAmount].is_requirefield = 'N';
      } else {
        newData[indexVatBaseTotalAmount].is_requirefield = 'Y';
      }
    }

    setData(newData);
    props.values.fields = data;
  };

  const onSelectWhtRateChange = (index) => (e) => {
    let newData = [...data];
    e = e === null ? 0 : e;
    newData[index].ocr_result = `${e}`;

    newData = calculateAlternativePayeeAmount(newData)

    const indexWhtBaseTotalAmount = newData.findIndex(
      (item) => item.display_name === fieldName.whtBaseTotalAmount,
    );
    if (indexWhtBaseTotalAmount !== -1) {
      if (e === null || e === 0) {
        newData[indexWhtBaseTotalAmount].is_requirefield = 'N';
      } else {
        newData[indexWhtBaseTotalAmount].is_requirefield = 'Y';
      }
    }

    setData(newData);
    props.values.fields = data;
  };

  let timeout;
  let currentValue;

  // Fetch full name
  function fetch(value, callback) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    function fake() {
      setFetching(false);
      getApproversGdcByStartWithName(value).then((data) => {
        if (currentValue === value) {
          setFetching(false);
          callback(data);
        }
      });
    }

    timeout = setTimeout(fake, 300);
  }

  function fetchDbApprover(value, callback) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    function fake() {
      setFetching(false);
      getApproversDbByStartWithName(value).then((data) => {
        if (currentValue === value) {
          setFetching(false);
          callback(data);
        }
      });
    }

    timeout = setTimeout(fake, 300);
  }

  function fetchDbReviewer(value, callback) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    function fake() {
      setFetching(false);
      getReviewersDbByStartWithName(value).then((data) => {
        if (currentValue === value) {
          setFetching(false);
          callback(data);
        }
      });
    }

    timeout = setTimeout(fake, 300);
  }

  function fetchDbRequester(value, callback) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    function fake() {
      setFetching(false);
      getRequestersDbByStartWithName(value).then((data) => {
        if (currentValue === value) {
          setFetching(false);
          callback(data);
        }
      });
    }

    timeout = setTimeout(fake, 300);
  }
  // Get master data for each fields
  function getMasterDataForEachFields() {
    try {
      getOCRResultByFileId(fileId).then(async (response) => {
        // Set data to table
        props.values.fields = response;

        // VAT Base Total Amount
        const indexVatBaseTotalAmount = response.findIndex(
          (item) => item.display_name === fieldName.vatBaseTotalAmount,
        );
        const indexVatRate = response.findIndex((item) => item.display_name === fieldName.vatRate);
        if (indexVatBaseTotalAmount !== -1 && indexVatRate !== -1) {
          if (response[indexVatRate].ocr_result === '0') {
            response[indexVatBaseTotalAmount].is_requirefield = 'N';
          } else {
            response[indexVatBaseTotalAmount].is_requirefield = 'Y';
          }
        }

        // WHT Base Total Amount
        const indexWhtBaseTotalAmount = response.findIndex(
          (item) => item.display_name === fieldName.whtBaseTotalAmount,
        );
        const indexWhtRate = response.findIndex((item) => item.display_name === fieldName.whtRate);
        if (indexWhtBaseTotalAmount !== -1 && indexWhtRate !== -1) {
          if (response[indexWhtRate].ocr_result === '0') {
            response[indexWhtBaseTotalAmount].is_requirefield = 'N';
          } else {
            response[indexWhtBaseTotalAmount].is_requirefield = 'Y';
          }
        }

        // WHT 2 Base Total Amount
        const indexWht2BaseTotalAmount = response.findIndex(
          (item) => item.display_name === fieldName.whtBaseTotalAmount,
        );
        const indexWht2Rate = response.findIndex((item) => item.display_name === fieldName.wht2Rate);
        if (indexWhtBaseTotalAmount !== -1 && indexWht2Rate !== -1) {
          if (response[indexWht2Rate].ocr_result === '0') {
            response[indexWht2BaseTotalAmount].is_requirefield = 'N';
          } else {
            response[indexWht2BaseTotalAmount].is_requirefield = 'Y';
          }
        }

        // WHT 3 Base Total Amount
        const indexWht3BaseTotalAmount = response.findIndex(
          (item) => item.display_name === fieldName.whtBaseTotalAmount,
        );
        const indexWht3Rate = response.findIndex((item) => item.display_name === fieldName.wht3Rate);
        if (indexWht3BaseTotalAmount !== -1 && indexWht3Rate !== -1) {
          if (response[indexWht3Rate].ocr_result === '0') {
            response[indexWht3BaseTotalAmount].is_requirefield = 'N';
          } else {
            response[indexWht3BaseTotalAmount].is_requirefield = 'Y';
          }
        }

        // WHT 4 Base Total Amount
        const indexWht4BaseTotalAmount = response.findIndex(
          (item) => item.display_name === fieldName.whtBaseTotalAmount,
        );
        const indexWht4Rate = response.findIndex((item) => item.display_name === fieldName.wht4Rate);
        if (indexWht4BaseTotalAmount !== -1 && indexWht4Rate !== -1) {
          if (response[indexWht4Rate].ocr_result === '0') {
            response[indexWht4BaseTotalAmount].is_requirefield = 'N';
          } else {
            response[indexWht4BaseTotalAmount].is_requirefield = 'Y';
          }
        }

        // WHT 5 ase Total Amount
        const indexWht5BaseTotalAmount = response.findIndex(
          (item) => item.display_name === fieldName.whtBaseTotalAmount,
        );
        const indexWht5Rate = response.findIndex((item) => item.display_name === fieldName.wht5Rate);
        if (indexWht5BaseTotalAmount !== -1 && indexWht5Rate !== -1) {
          if (response[indexWht5Rate].ocr_result === '0') {
            response[indexWht5BaseTotalAmount].is_requirefield = 'N';
          } else {
            response[indexWht5BaseTotalAmount].is_requirefield = 'Y';
          }
        }

        // Calculate Vat Amount
        const indexAmount = response.findIndex((item) => item.display_name === fieldName.amount);
        const amountExcludeVat =  indexAmount == -1 ? 0 : parseFloat(response[indexAmount].ocr_result) || 0; // get value Amount (Exclude Vat.)	
        const vatBaseTotalAmount = indexVatBaseTotalAmount == -1 ? 0 : parseFloat(response[indexVatBaseTotalAmount].ocr_result) || 0; // get VAT Base Total Amount
        
        const vatAmount = vatBaseTotalAmount * ( response[indexVatRate].ocr_result /100);
        const totalAmountIncludeVat = amountExcludeVat + vatAmount;

        // default object data
        const newObjectData = { 
          is_ocr: false,
          is_requirefield: 'N'
        };

        // Add Row - Vat Amount & Total Amount (Include Vat) - Start
        if (indexVatBaseTotalAmount !== -1 && indexVatRate !== -1) {
          const object = [
            {
              ...newObjectData,
              ocr_result: vatAmount.toFixed(3),
              display_name: fieldName.vatAmount,
              field_name: fieldName.vatAmount
            },
            {
              ...newObjectData,
              ocr_result: totalAmountIncludeVat.toFixed(3),
              display_name: fieldName.amountIncludeVat,
              field_name: fieldName.amountIncludeVat
            },
          ] 
          
          response.splice(indexVatBaseTotalAmount + 1, 0, ...object);
        }
        // Add Row - Vat Amount & Total Amount (Include Vat) - End

        // Add Row - WHT Amount - End
        const lastIndexWhtBaseTotalAmount = response.findIndex((item) => item.display_name === fieldName.whtBaseTotalAmount);
        const lastIndexWhtRate = response.findIndex((item) => item.display_name === fieldName.whtRate);

        const whtBaseTotalAmount =  lastIndexWhtBaseTotalAmount == -1 ? 0 : parseFloat(response[lastIndexWhtBaseTotalAmount].ocr_result) || 0; // get WHT Base Total Amount
        const whtAmount = whtBaseTotalAmount * ( response[lastIndexWhtRate].ocr_result /100);


        if (lastIndexWhtBaseTotalAmount !== -1 && lastIndexWhtRate !== -1) {
          const object = {
            ...newObjectData,
            ocr_result: whtAmount.toFixed(3),
            display_name: fieldName.whtAmount,
            field_name: fieldName.whtAmount
          }
          response.splice(lastIndexWhtBaseTotalAmount + 1, 0, object);
        }
        // Add Row - WHT Amount - End     

        // Check Due Date to Auto Date - Start
        const indexDueDate = response.findIndex((item) => item.display_name === fieldName.dueDate);
        if (indexDueDate !== -1 && (response[indexDueDate].ocr_result === null || response[indexDueDate].ocr_result === "")) {
          const indexDocumentDate = response.findIndex((item) => item.display_name === fieldName.documentDate);
          if (indexDocumentDate !== -1 && response[indexDocumentDate].ocr_result && response[indexDocumentDate].ocr_result !== "") {
            const documentDate = response[indexDocumentDate].ocr_result;
            const newDate = new Date(documentDate);
            newDate.setDate(newDate.getDate() + (day_auto_duedate || 30) );
            response[indexDueDate].ocr_result = newDate.toISOString().slice(0, -1) + documentDate.slice(-6);
          }
        }
        // Check Due Date to Auto Date - End

        setData(response);

        // Response should not be null
        if (response !== null) {
          // Payment Type
          const indexPaymemtType = response.findIndex(
            (data) => data.display_name === fieldName.paymentType,
          );
          const valuePaymemtType =
            indexPaymemtType === -1 ? '' : response[indexPaymemtType].ocr_result;
          // Creator
          const indexCreator = response.findIndex(
            (data) => data.display_name === fieldName.creator,
          );
          const valueCreator = indexCreator == -1 ? '' : response[indexCreator].ocr_result;
          // Requestor
          const indexRequestor = response.findIndex(
            (data) => data.display_name === fieldName.requestor,
          );
          const valueRequestor = indexRequestor == -1 ? '' : response[indexRequestor].ocr_result;
          // Reviewer
          const indexReviewer = response.findIndex(
            (item) => item.display_name === fieldName.reviewer,
          );
          const valueReviewer = indexReviewer == -1 ? '' : response[indexReviewer].ocr_result;
          // CC
          const indexCC = response.findIndex((item) => item.display_name === fieldName.cc);
          const valueCC = indexCC == -1 ? '' : response[indexCC].ocr_result;
          // Approver
          const indexApprover = response.findIndex(
            (item) => item.display_name === fieldName.approver,
          );
          const valueApprover = indexApprover == -1 ? '' : response[indexApprover].ocr_result;

          // Vendor
          const indexVendorCode = response.findIndex(
            (data) => data.display_name === fieldName.vendor,
          );
          const valueVendorCode = indexVendorCode == -1 ? '' : response[indexVendorCode].ocr_result;

          // Comapny
          const indexCompany = response.findIndex(
            (data) => data.display_name === fieldName.company,
          );
          const company_code = indexCompany === -1 ? undefined : response[indexCompany].ocr_result;

          const formTypeList = getFormTypesList();
          const companiesList = getCompaniesOptionList();
          const statusList = getStatusList();
          const paymentTypesList =
            company_code === undefined || company_code === '' || company_code === null
              ? []
              : getPaymentTypesListByCompanyCode(company_code);
          const paymentLocationsList =
            valuePaymemtType === undefined ||
            valuePaymemtType === '' ||
            company_code === undefined ||
            company_code === '' ||
            company_code === null
              ? []
              : getPaymentLocationsListByPaymentTypeCodeCompanyCode(valuePaymemtType, company_code);
          const grApprovalForsList =
            company_code === undefined || company_code === '' || company_code === null
              ? []
              : getGRApprovalForsListByCompanyCode(company_code);
          const currenciesList = getCurrenciesList();
          const creator = getApproversGdcByAdAccount(valueCreator);
          const requestor =
            userProfile.bu === 'SCGC'
              ? getApproversGdcByAdAccount(valueRequestor)
              : getRequestersDbByStartWithEmail(valueRequestor);
          const reviewer =
            userProfile.bu === 'SCGC'
              ? getApproversGdcByAdAccount(valueReviewer)
              : getReviewersDbByStartWithEmail(valueReviewer);
          const cc =
            userProfile.bu === 'SCGC'
              ? getApproversGdcByAdAccount(valueCC)
              : getReviewersDbByStartWithEmail(valueCC);
          const approver =
            userProfile.bu === 'SCGC'
              ? getApproversGdcByAdAccount(valueApprover)
              : getApproversDbByStartWithEmail(valueApprover);
          const vendorsList = getVendorsList();
          const beneficiariesList =
            valueVendorCode === undefined || valueVendorCode === ''
              ? []
              : getBeneficiariesListByVendorCode(valueVendorCode, company_code);
          const remittedCurrenciesList = getRemittedCurrenciesList();
          const paidForsList = getPaidForsList();
          const preAdvicesList = getPreAdvicesList();
          const bankChargesList = getBankChargesList();
          const serviceTeamsList = getServiceTeamsList();
          const documentTypeList = getDocumentTypeList();
          const taxRatesList = getTaxRatesList();
          const whtRatesList = getWhtRatesList();
          const expensesList = getExpensesList();
          const costCentersList = getCostCentersList();
          const internalOrdersList = getInternalOrdersList();

          Promise.all([
            formTypeList,
            companiesList,
            statusList,
            paymentTypesList,
            paymentLocationsList,
            grApprovalForsList,
            currenciesList,
            creator,
            requestor,
            reviewer,
            cc,
            approver,
            vendorsList,
            beneficiariesList,
            remittedCurrenciesList,
            paidForsList,
            preAdvicesList,
            bankChargesList,
            serviceTeamsList,
            documentTypeList,
            taxRatesList,
            whtRatesList,
            expensesList,
            costCentersList,
            internalOrdersList,
          ]).then((data) => {
            setFormType(data[0]);
            setCompany(data[1]);
            setStatus(data[2]);
            setPaymentType(data[3]);
            setPaymentLocation(data[4]);
            setGrApprovalFor(data[5]);
            setCurrency(data[6]);
            data[7][0] === undefined ? setCreator([]) : setCreator(data[7]);
            data[8][0] === undefined ? setRequestor([]) : setRequestor(data[8]);
            data[9][0] === undefined ? setReviewer([]) : setReviewer(data[9]);
            data[10][0] === undefined ? setCC([]) : setCC(data[10]);
            data[11][0] === undefined ? setApprover([]) : setApprover(data[11]);
            setAlternativePayeeVendor(data[12]);
            setBeneficiary(data[13]);
            setRemittedCurrency(data[14]);
            setPaidFor(data[15]);
            setPreAdvice(data[16]);
            setBankCharge(data[17]);
            setServiceTeam(data[18]);
            setDocumentType(data[19]);
            setVatRate(data[20]);
            setWhtRate(data[21]);
            setExpenseCode(data[22]);
            setCostCenter(data[23]);
            setInternalOrderNo(data[24]);

            setLoading(false);
            props.values.loading = false;
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getMasterDataForEachFields();
  }, []);

  const columns = [
    {
      title: intl.formatMessage({ id: 'page.modal.column.isOcr' }),
      dataIndex: 'is_ocr',
      width: '5%',
      editable: false,
      align: 'center',
      render: (text, row) => {
        return row.display_name === fieldName.header || row.display_name === fieldName.item ? (
          {
            children: '',
            props: {
              colSpan: 0,
            },
          }
        ) : (
          <Checkbox checked={text} disabled={true} />
        );
      },
    },
    {
      key: 'display_name',
      title: intl.formatMessage({ id: 'page.modal.column.allPayField' }),
      dataIndex: 'display_name',
      width: '30%',
      editable: false,
      render: (text, row) => {
        return row.display_name === fieldName.header || row.display_name === fieldName.item ? (
          {
            children: (
              <>
                <span style={{ fontWeight: 'bold' }}> {row.display_name}</span>
              </>
            ),
            props: {
              colSpan: 12,
              style: {
                textAlign: 'center',
                backgroundColor: '#e6ffff',
              },
            },
          }
        ) : (
          <span>
            {text}
            <span style={{ color: 'red' }}>{row.is_requirefield === 'Y' ? '*' : ''} </span>
          </span>
        );
      },
    },
    {
      key: 'ocr_result',
      title: intl.formatMessage({ id: 'page.modal.column.ocrresult' }),
      dataIndex: 'ocr_result',
      render: (text, row, index) => {
        return row.display_name === fieldName.header || row.display_name === fieldName.item ? (
          {
            children: '',
            props: {
              colSpan: 0,
            },
          }
        ) : row.is_display === fieldList.is_display ? (
          row.display_name === fieldName.formType ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            >
              {formType && formType.length > 0
                ? formType.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.company ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectCompany(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            >
              {company && company.length > 0
                ? company.map((item) => (
                    <Option key={item.company_code} value={item.company_code}>
                      {item.company_name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.alternativePayeeAmount ? (
            <Input
              disabled={true}
              placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
              value={text === '' ? undefined : text}
            />
          ) : row.display_name === fieldName.vendor ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {alternativePayeeVendor && alternativePayeeVendor.length > 0
                ? alternativePayeeVendor.map((item) => (
                    <Option key={item.vendor_code} value={item.vendor_code}>
                      {item.vendor_name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.status ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {status && status.length > 0
                ? status.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.paymentType ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectPaymentType(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            >
              {paymentType && paymentType.length > 0
                ? paymentType.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.paymentLocation ? (
            <Select
              value={
                text === 'undefined' ||
                text === 'undefined' ||
                text === undefined ||
                text === null ||
                text === ''
                  ? undefined
                  : text
              }
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            >
              {paymentLocation && paymentLocation.length > 0
                ? paymentLocation.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.grApprovalFor ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            >
              {grApprovalFor && grApprovalFor.length > 0
                ? grApprovalFor.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.currency ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
                option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            >
              {currency && currency.length > 0
                ? currency.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.requestor ? (
            <Select
              disabled={!isEditing}
              showSearch
              value={
                text === 'undefined' || text === undefined || text === null
                  ? undefined
                  : text === ''
                  ? undefined
                  : Array.isArray(text)
                  ? text
                  : text.split(',')
              }
              style={{ width: '100%' }}
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onSearch={onRequestorSearch}
              onChange={onSelectChange(index)}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {requestor && requestor.length > 0
                ? requestor.map((item) => <Option key={item.value}>{item.text}</Option>)
                : null}
            </Select>
          ) : row.display_name === fieldName.reviewer ? (
            <Select
              disabled={!isEditing}
              showSearch
              value={
                text === 'undefined' || text === undefined || text === null
                  ? undefined
                  : text === ''
                  ? undefined
                  : Array.isArray(text)
                  ? text
                  : text.split(',')
              }
              style={{ width: '100%' }}
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onSearch={onReviewerSearch}
              onChange={onSelectChange(index)}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
              mode="multiple"
              allowClear
            >
              {reviewer && reviewer.length > 0
                ? reviewer.map((item) => <Option key={item.value}>{item.text}</Option>)
                : null}
            </Select>
          ) : row.display_name === fieldName.cc ? (
            <Select
              disabled={!isEditing}
              allowClear
              defaultActiveFirstOption={false}
              filterOption={false}
              mode="multiple"
              notFoundContent={fetching ? <Spin size="small" /> : null}
              onChange={onSelectChange(index)}
              onSearch={onCCSearch}
              placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
              showArrow={false}
              showSearch
              style={{ width: '100%' }}
              value={
                text === 'undefined' || text === undefined || text === null
                  ? undefined
                  : text === ''
                  ? undefined
                  : Array.isArray(text)
                  ? text
                  : text.split(',')
              }
            >
              {cc && cc.length > 0
                ? cc.map((item) => <Option key={item.value}>{item.text}</Option>)
                : null}
            </Select>
          ) : row.display_name === fieldName.approver ? (
            <Select
              disabled={!isEditing}
              showSearch
              value={
                text === 'undefined' || text === undefined || text === null || text === ''
                  ? undefined
                  : text
              }
              style={{ width: '100%' }}
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onSearch={onApproverSearch}
              onChange={onSelectChange(index)}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
              allowClear
            >
              {approver && approver.length > 0
                ? approver.map((item) => <Option key={item.value}>{item.text}</Option>)
                : null}
            </Select>
          ) : row.display_name === fieldName.alternativePayeeVendor ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {alternativePayeeVendor && alternativePayeeVendor.length > 0
                ? alternativePayeeVendor.map((item) => (
                    <Option key={item.vendor_code} value={item.vendor_code}>
                      {item.vendor_name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.beneficiary ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {beneficiary && beneficiary.length > 0
                ? beneficiary.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.remittedCurrency ? (
            <Select
              disabled={!isEditing}
              value={
                text === 'undefined' || text === undefined || text === null || text === ''
                  ? undefined
                  : text
              }
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {remittedCurrency && remittedCurrency.length > 0
                ? remittedCurrency.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.remittedToCurrency ? (
            <Select
              disabled={!isEditing}
              value={
                text === 'undefined' || text === undefined || text === null || text === ''
                  ? undefined
                  : text
              }
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {currency && currency.length > 0
                ? currency.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.paidFor ? (
            <Select
              disabled={!isEditing}
              value={
                text === 'undefined' || text === undefined || text === null || text === ''
                  ? undefined
                  : text
              }
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {paidFor && paidFor.length > 0
                ? paidFor.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.preAdvice ? (
            <Select
              disabled={!isEditing}
              value={
                text === 'undefined' || text === undefined || text === null || text === ''
                  ? undefined
                  : text
              }
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {preAdvice && preAdvice.length > 0
                ? preAdvice.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.allBankChargeOutsideCompanyCountryFor ? (
            <Select
              disabled={!isEditing}
              value={
                text === 'undefined' || text === undefined || text === null || text === ''
                  ? undefined
                  : text
              }
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {bankCharge && bankCharge.length > 0
                ? bankCharge.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.allBankChargeInsideCompanyCountryFor ? (
            <Select
              disabled={!isEditing}
              value={
                text === 'undefined' || text === undefined || text === null || text === ''
                  ? undefined
                  : text
              }
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {bankCharge && bankCharge.length > 0
                ? bankCharge.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.serviceTeam ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {serviceTeam && serviceTeam.length > 0
                ? serviceTeam.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.vatRate ? (
            <InputNumber
              disabled={!isEditing}
              value={ text === '' || text === null ? 0 :  text }
              min = {0}
              max = {100}
              onChange={onSelectVatRateChange(index)}
              size="small"
              allowClear
              onKeyPress={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              suffix="%"
              placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
            />
            ) : [fieldName.whtRate, fieldName.wht2Rate, fieldName.wht3Rate, fieldName.wht4Rate, fieldName.wht5Rate].includes(row.display_name) ? (
            <InputNumber
              disabled={!isEditing}
              value={ text === '' || text === null ? 0 :  text }
              min = {0}
              max = {100}
              onChange={onSelectWhtRateChange(index)}
              size="small"
              allowClear
              onKeyPress={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              suffix="%"
              placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
            />
          ) : row.display_name === fieldName.expense ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {expenseCode && expenseCode.length > 0
                ? expenseCode.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.costCenter ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {costCenter && costCenter.length > 0
                ? costCenter.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.display_name === fieldName.internalOrderNo ? (
            <Select
              disabled={!isEditing}
              value={text === 'undefined' || text === '' ? undefined : text}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '100%' }}
              onChange={onSelectChange(index)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              allowClear
            >
              {internalOrderNo && internalOrderNo.length > 0
                ? internalOrderNo.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))
                : null}
            </Select>
          ) : row.field_type === fieldList.fieldTypeDt ? (
            <DatePicker
              disabled={!isEditing}
              allowClear={false}
              value={
                text === 'undefined' || text === undefined || text === null || text === ''
                  ? undefined
                  : moment(new Date(text), dateFormat)
              }
              onChange={onDatePickerChange(index)}
              style={{ width: '100%' }}
              format={dateFormat}
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            />
          ) : row.field_type === fieldList.fieldTypeD ? (
            <InputNumber
              disabled={!isEditing}
              value={
                text === 'undefined' || text === undefined
                  ? undefined
                  : text === ''
                  ? undefined
                  : text
              }
              onChange={onInputNumberChange(index)}
              size="small"
              allowClear
              onKeyPress={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
            />
          ) : row.field_type === fieldList.fieldTypeB ? (
            <Switch
              disabled={!isEditing}
              checked={
                text === 'undefined' || text === undefined || text === null || text === ''
                  ? false
                  : text
              }
              onChange={onSwitchChange(index)}
              placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
              size="default"
              trackColor={{ true: 'green', false: 'grey' }}
            />
          ) : (
            <Input
              disabled={!isEditing}
              allowClear
              onChange={onInputChange(index)}
              placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
              value={text === '' ? undefined : text}
            />
          )
        ) : row.display_name === fieldName.vendor ? (
          <Select
            disabled={true}
            placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            style={{ width: '100%' }}
            value={text === 'undefined' || text === '' ? undefined : text}
          >
            {alternativePayeeVendor && alternativePayeeVendor.length > 0
              ? alternativePayeeVendor.map((item) => (
                  <Option key={item.vendor_code} value={item.vendor_code}>
                    {item.vendor_name}
                  </Option>
                ))
              : null}
          </Select>
        ) : row.display_name === fieldName.creator ? (
          <Select
            disabled={true}
            placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            style={{ width: '100%' }}
            value={
              text === 'undefined' || text === undefined
                ? undefined
                : text === ''
                ? undefined
                : Array.isArray(text)
                ? text
                : text.split(',')
            }
          >
            {creator && creator.length > 0
              ? creator.map((item) => <Option key={item.value}>{item.text}</Option>)
              : null}
          </Select>
        ) : row.display_name === fieldName.documentType ? (
          <Select
            disabled={true}
            placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            style={{ width: '100%' }}
            value={text === 'undefined' || text === '' ? undefined : text}
          >
            {documentType && documentType.length > 0
              ? documentType.map((item) => (
                  <Option key={item.code} value={item.code}>
                    {item.name}
                  </Option>
                ))
              : null}
          </Select>
        ) : row.field_type === fieldList.fieldTypeDt ? (
          <DatePicker
            disabled={true}
            format={dateFormat}
            placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            style={{ width: '100%' }}
            value={
              text === 'undefined' || text === undefined || text === null || text === ''
                ? undefined
                : moment(new Date(text), dateFormat)
            }
          />
        ) : row.field_type === fieldList.fieldTypeD ? (
          <InputNumber
            disabled={true}
            placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
            size="small"
            value={text === undefined ? undefined : text === '' ? undefined : text}
          />
        ) : row.field_type === fieldList.fieldTypeB ? (
          <Switch
            checked={
              text === 'undefined' || text === undefined || text === null || text === ''
                ? false
                : text
            }
            disabled={true}
            placeholder={`${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`}
            size="default"
            trackColor={{ true: 'green', false: 'grey' }}
          />
        ) : (
          <Input
            disabled={true}
            placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
            value={text === '' ? undefined : text}
          />
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        bordered
        className={styles.container}
        columns={mergedColumns}
        dataSource={loading ? null : data}
        disabled={loading}
        loading={loading}
        locale={{ emptyText: '' }}
        pagination={false}
        rowClassName="editable-row"
        rowKey="field_name"
        size="small"
      />
    </Form>
  );
};

// export default () => (
//   <div className={styles.container}>
//     <div id="components-table-demo-edit-row">
//       <EditableTable />
//     </div>
//   </div>
// );

export default EditableTable;
