import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Input,
  InputNumber,
  Modal,
  message,
  Card,
  Table,
  Select,
  Checkbox,
  DatePicker,
  Spin,
  Popconfirm,
  Switch,
} from 'antd';
import { FormattedMessage, useIntl } from 'umi';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { getMasterDataItemsByMasterDataId, createMasterData } from '@/services/masterData';
import { getDocumentsList } from '@/services/document';
import { getVendorsList } from '@/services/vendor';
import { getFormTypesList } from '@/services/formType';
import { getPaymentTypesListByCompanyCode } from '@/services/paymentType';
import { getCompaniesOptionList } from '@/services/company';
import { getCurrenciesList } from '@/services/currency';
import { getServiceTeamsList } from '@/services/serviceTeam';
import { getTaxRatesList } from '@/services/taxRate';
import { getWhtRatesList } from '@/services/whtRate';
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
import { getExpensesList } from '@/services/expense';
import { getNumberStyleList } from '@/services/numberStyle';
import { getCostCentersList } from '@/services/costcenter';
import { getBeneficiariesListByVendorCode } from '@/services/beneficiary';
import { getGRApprovalForsListByCompanyCode } from '@/services/grApprovalFor';
import { getInternalOrdersList } from '@/services/internalOrder';
import { getBankChargesList } from '@/services/bankCharge';
import { getPaidForsList } from '@/services/paidFor';
import { getPreAdvicesList } from '@/services/preAdvice';
import { getRemittedCurrenciesList } from '@/services/remittedCurrency';
import { getPaymentLocationsListByPaymentTypeCodeCompanyCode } from '@/services/paymentLocation';
import fieldName from '@/utils/fieldName';
import moment from 'moment';
import styles from './components.less';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

const { Option } = Select;
const { TextArea } = Input

const CopyForm = (props) => {
  const [form] = Form.useForm();
  const { onCancel: handleCopyModalVisible, copyModalVisible, values } = props;

  const renderFooter = () => {
    return <div></div>;
  };

  // Common object
  const masterdata_id = props.values.masterdata_id;
  const document_code = props.values.document_code;
  const vendor_code = props.values.vendor_code;
  const model_id = props.values.model_id;
  const model_template_id = props.values.model_template_id;
  const day_auto_duedate = props.values.day_auto_duedate || 30;
  const ai_prompt = props.values.ai_prompt;
  const [numberStyleId, setNumberStyleId] = useState(props.values.number_style_id);
  const [fetching, setFetching] = useState();
  const [loading, setLoading] = useState(true);
  const disable = false;
  const intl = useIntl();
  const dateFormat = 'DD/MM/YYYY';
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Item
  const [masterField, setMasterField] = useState([]);
  const [masterWHTField, setMasterWHTField] = useState([]);

  // Set of master data
  const [document, setDocument] = useState([]);
  const [vendor, setVendor] = useState([]);
  const [formType, setFormType] = useState([]);
  const [company, setCompany] = useState([]);
  const [paymentType, setPaymentType] = useState([]);
  const [grApprovalFor, setGrApprovalFor] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [approver, setApprover] = useState([]);
  const [requestor, setRequestor] = useState([]);
  const [reviewer, setReviewer] = useState([]);
  const [cc, setCC] = useState([]);
  const [beneficiary, setBeneficiary] = useState([]);
  const [serviceTeam, setServiceTeam] = useState([]);
  const [taxRate, setTaxRate] = useState([]);
  const [whtRate, setWhtRate] = useState([]);
  const [expense, setExpense] = useState([]);
  const [costCenter, setCostCenter] = useState([]);
  const [internalOrder, setInternalOrder] = useState([]);
  const [bankCharge, setBankCharge] = useState([]);
  const [paidFor, setPaidFor] = useState([]);
  const [preAdvice, setPreAdvice] = useState([]);
  const [remittedCurrency, setRemittedCurrency] = useState([]);
  const [paymentLocation, setPaymentLocation] = useState([]);
  const [numberStyleList, setNumberStyleList] = useState([]);

  let timeout;
  let currentValue;

  function fetch(value, callback) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    function fake() {
      getApproversGdcByStartWithName(value).then((data) => {
        if (currentValue === value) {
          setLoading(false);
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
      getApproversDbByStartWithName(value).then((data) => {
        if (currentValue === value) {
          setLoading(false);
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
      getReviewersDbByStartWithName(value).then((data) => {
        if (currentValue === value) {
          setLoading(false);
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
      getRequestersDbByStartWithName(value).then((data) => {
        if (currentValue === value) {
          setLoading(false);
          callback(data);
        }
      });
    }

    timeout = setTimeout(fake, 300);
  }

  const columns = [
    {
      title: intl.formatMessage({ id: 'page.modal.column.isActive' }),
      dataIndex: 'is_display',
      width: '5%',
      editable: !disable,
      align: 'center',
      render: (text, row, index) => {
        return row.display_name === fieldName.header ||
          row.display_name === fieldName.item ||
          row.display_name === fieldName.WHTAction ? (
          {
            children:
              row.display_name === fieldName.WHTAction ? (
                <span style={{ fontWeight: 'bold' }}> {'WHT'}</span>
              ) : (
                <span style={{ fontWeight: 'bold' }}> {row.display_name}</span>
              ),
            props: {
              colSpan: row.display_name === fieldName.WHTAction ? 3 : 5,
            },
          }
        ) : (
          <Checkbox
            checked={text}
            onChange={onCheckboxChange('is_display', index)}
            disabled={disable ? disable : row.is_requirefield === 'Y' ? true : false}
          />
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.isOcr' }),
      dataIndex: 'is_ocr',
      width: '5%',
      editable: !disable,
      align: 'center',
      render: (text, row, index) => {
        return row.display_name === fieldName.header ||
          row.display_name === fieldName.item ||
          row.display_name === fieldName.WHTAction ? (
          {
            children:
              row.display_name === fieldName.WHTAction ? (
                <div>
                  <Button
                    style={{ width: '40%', marginRight: 2 }}
                    onClick={onClickActionAddWTH}
                    disabled={!masterWHTField.length}
                  >
                    {' '}
                    {'Add'}
                  </Button>
                  <Button
                    danger
                    style={{ width: '40%', marginLeft: 2 }}
                    onClick={onClickActionDeleteWTH}
                  >
                    {' '}
                    {'Delete'}
                  </Button>
                </div>
              ) : (
                ''
              ),
            props: {
              colSpan: row.display_name === fieldName.WHTAction ? 2 : 0,
            },
          }
        ) : (
          <Checkbox
            checked={text}
            onChange={onCheckboxChange('is_ocr', index)}
            disabled={disable}
          />
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.isVariable' }),
      dataIndex: 'is_variable',
      width: '5%',
      editable: !disable,
      align: 'center',
      render: (text, row, index) => {
        return row.display_name === fieldName.header ||
          row.display_name === fieldName.item ||
          row.display_name === fieldName.WHTAction ? (
          {
            children: '',
            props: {
              colSpan: 0,
            },
          }
        ) : (
          <Checkbox
            checked={text}
            onChange={onCheckboxChange('is_variable', index)}
            disabled={disable || row.is_ocr}
          />
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.allPayField' }),
      dataIndex: 'display_name',
      width: '40%',
      editable: false,
      render: (text, row) => {
        return row.display_name === fieldName.header ||
          row.display_name === fieldName.item ||
          row.display_name === fieldName.WHTAction ? (
          {
            children: '',
            props: {
              colSpan: 0,
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
      key: 'default_value',
      title: intl.formatMessage({ id: 'page.modal.column.defaultValue' }),
      dataIndex: 'default_value',
      editable: !disable,
      render: (text, row, index) => {
        return row.display_name === fieldName.header ||
          row.display_name === fieldName.item ||
          row.display_name === fieldName.WHTAction ? (
          {
            children: '',
            props: {
              colSpan: 0,
            },
          }
        ) : row.is_variable ? (
          <Select
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${'variable name'}`
            }
            allowClear
            disabled={disable}
          >
            {masterField && masterField.length > 0
              ? masterField
                  .filter((item) => item.is_ocr)
                  .map((item) => (
                    <Option key={item.field_name} value={item.display_name}>
                      {item.display_name}
                    </Option>
                  ))
              : null}
          </Select>
        ) : row.display_name === fieldName.formType ? (
          <Select
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectCompanyChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
              option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
          >
            {company && company.length > 0
              ? company.map((item) => (
                  <Option key={item.company_code} value={item.company_code}>
                    {item.company_name}
                  </Option>
                ))
              : null}
          </Select>
        ) : row.display_name === fieldName.paymentType ? (
          <Select
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectPaymentTypeChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
              option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
          >
            {currency && currency.length > 0
              ? currency.map((item) => (
                  <Option key={item.code} value={item.code}>
                    {item.name}
                  </Option>
                ))
              : null}
          </Select>
        ) : row.display_name === fieldName.alternativePayeeVendor ? (
          <Select
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
          >
            {vendor && vendor.length > 0
              ? vendor.map((item) => (
                  <Option key={item.vendor_code} value={item.vendor_code}>
                    {item.vendor_name}
                  </Option>
                ))
              : null}
          </Select>
        ) : row.display_name === fieldName.beneficiary ? (
          <Select
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            disabled={disable}
            value={ text === '' || text === null ? 0 :  text }
            min = {0}
            max = {100}
            onChange={onSelectVatRateChange('default_value', index)}
            size="small"
            allowClear
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
          />
        ) : [
            fieldName.whtRate,
            fieldName.wht2Rate,
            fieldName.wht3Rate,
            fieldName.wht4Rate,
            fieldName.wht5Rate,
          ].includes(row.display_name) ? (
          <InputNumber
            disabled={disable}
            value={ text === '' || text === null ? 0 :  text }
            min = {0}
            max = {100}
            onChange={onSelectWhtRateChange('default_value', index, row.display_name)}
            size="small"
            allowClear
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`}
          />
        ) : row.display_name === fieldName.expense ? (
          <Select
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
          >
            {expense && expense.length > 0
              ? expense.map((item) => (
                  <Option key={item.code} value={item.code}>
                    {item.name}
                  </Option>
                ))
              : null}
          </Select>
        ) : row.display_name === fieldName.costCenter ? (
          <Select
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
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
            value={text === undefined || text === null || text === '' ? undefined : text}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            style={{ width: '100%' }}
            onChange={onSelectChange('default_value', index)}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
          >
            {internalOrder && internalOrder.length > 0
              ? internalOrder.map((item) => (
                  <Option key={item.code} value={item.code}>
                    {item.name}
                  </Option>
                ))
              : null}
          </Select>
        ) : row.display_name === fieldName.requestor ? (
          <Select
            showSearch
            value={text === undefined || text === null || text === '' ? undefined : text}
            style={{ width: '100%' }}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={onRequestorSearch}
            onChange={onRequestorChange('default_value', index)}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
          >
            {requestor && requestor.length > 0
              ? requestor.map((item) => <Option key={item.value}>{item.text}</Option>)
              : null}
          </Select>
        ) : row.display_name === fieldName.reviewer ? (
          <Select
            showSearch
            value={
              text === undefined || text === null || text === ''
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
            onChange={onReviewerChange('default_value', index)}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`
            }
            mode="multiple"
            allowClear
            disabled={disable}
          >
            {reviewer && reviewer.length > 0
              ? reviewer.map((item) => <Option key={item.value}>{item.text}</Option>)
              : null}
          </Select>
        ) : row.display_name === fieldName.cc ? (
          <Select
            showSearch
            value={
              text === undefined || text === null || text === ''
                ? undefined
                : Array.isArray(text)
                ? text
                : text.split(',')
            }
            style={{ width: '100%' }}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={onCCSearch}
            onChange={onCCChange('default_value', index)}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`
            }
            mode="multiple"
            allowClear
            disabled={disable}
          >
            {cc && cc.length > 0
              ? cc.map((item) => <Option key={item.value}>{item.text}</Option>)
              : null}
          </Select>
        ) : row.display_name === fieldName.approver ? (
          <Select
            showSearch
            value={text === undefined || text === null || text === '' ? undefined : text}
            style={{ width: '100%' }}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={onApproverSearch}
            onChange={onApproverChange('default_value', index)}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.input' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
          >
            {approver && approver.length > 0
              ? approver.map((item) => <Option key={item.value}>{item.text}</Option>)
              : null}
          </Select>
        ) : row.field_type === 'B' ? (
          <Switch
            size="default"
            checked={text === undefined || text === null || text === '' ? false : text}
            onChange={onSwitchChange('default_value', index)}
          />
        ) : row.field_type === 'DT' ? (
          <DatePicker
            value={
              text === undefined || text === null || text === '' ? text : moment(text, dateFormat)
            }
            onChange={onDatePickerChange('default_value', index)}
            style={{ width: '100%' }}
            format={dateFormat}
            placeholder={
              disable
                ? null
                : `${intl.formatMessage({ id: 'page.modal.select' })} ${row.display_name}`
            }
            allowClear
            disabled={disable}
          />
        ) : row.field_type === 'D' ? (
          <InputNumber
            value={text === undefined || text === null || text === '' ? undefined : text}
            onChange={onInputNumberChange('default_value', index)}
            size="small"
            allowClear
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            disabled={disable}
          />
        ) : (
          <Input
            value={text === undefined || text === null || text === '' ? undefined : text}
            onChange={onInputChange('default_value', index)}
            allowClear
            onKeyPress={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            disabled={disable}
          />
        );
      },
    },
  ];

  const onClickActionAddWTH = () => {
    let newMasterField = [...masterField];
    const addWHTField = masterWHTField.slice(0, 7);
    const newMasterWHTField = masterWHTField.slice(7);
    addWHTField.forEach((itemField) => {
      const indexWHTAction = newMasterField.findIndex((item) => item.field_name === 'WHTAction');
      if (indexWHTAction !== -1) {
        newMasterField.splice(indexWHTAction, 0, itemField);
      }
    });
    setMasterField(newMasterField);
    setMasterWHTField(newMasterWHTField);
  };

  const onClickActionDeleteWTH = () => {
    const filterWHT5 = masterField.filter((item) => item.field_name.slice(0, 4) === 'WHT5');
    const filterWHT4 = masterField.filter((item) => item.field_name.slice(0, 4) === 'WHT4');
    const filterWHT3 = masterField.filter((item) => item.field_name.slice(0, 4) === 'WHT3');
    const filterWHT2 = masterField.filter((item) => item.field_name.slice(0, 4) === 'WHT2');
    if (filterWHT5.length) {
      const masterFieldWithOutWHT5 = masterField.filter(
        (item) => item.field_name.slice(0, 4) !== 'WHT5',
      );
      setMasterField(masterFieldWithOutWHT5);
      const newMasterWHTField = [
        ...masterField.filter((item) => item.field_name.slice(0, 4) === 'WHT5'),
        ...masterWHTField,
      ];
      setMasterWHTField(newMasterWHTField);
    } else if (filterWHT4.length) {
      const masterFieldWithOutWHT4 = masterField.filter(
        (item) => item.field_name.slice(0, 4) !== 'WHT4',
      );
      setMasterField(masterFieldWithOutWHT4);
      const newMasterWHTField = [
        ...masterField.filter((item) => item.field_name.slice(0, 4) === 'WHT4'),
        ...masterWHTField,
      ];
      setMasterWHTField(newMasterWHTField);
    } else if (filterWHT3.length) {
      const masterFieldWithOutWHT3 = masterField.filter(
        (item) => item.field_name.slice(0, 4) !== 'WHT3',
      );
      setMasterField(masterFieldWithOutWHT3);
      const newMasterWHTField = [
        ...masterField.filter((item) => item.field_name.slice(0, 4) === 'WHT3'),
        ...masterWHTField,
      ];
      setMasterWHTField(newMasterWHTField);
    } else if (filterWHT2.length) {
      const masterFieldWithOutWHT2 = masterField.filter(
        (item) => item.field_name.slice(0, 4) !== 'WHT2',
      );
      setMasterField(masterFieldWithOutWHT2);
      const newMasterWHTField = [
        ...masterField.filter((item) => item.field_name.slice(0, 4) === 'WHT2'),
        ...masterWHTField,
      ];
      setMasterWHTField(newMasterWHTField);
    }
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType:
          col.dataIndex === 'is_ocr' || col.dataIndex === 'is_display' ? 'checkbox' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
      }),
    };
  });

  const onInputChange = (key, index) => (e) => {
    const newData = [...masterField];
    if (e.target.value) {
      newData[index][key] = e.target.value;
    } else {
      newData[index][key] = '';
    }
    setMasterField(newData);
  };

  const onInputNumberChange = (key, index) => (e) => {
    const newData = [...masterField];
    if (e) {
      newData[index][key] = e;
    } else {
      newData[index][key] = '';
    }
    setMasterField(newData);
  };

  const onSelectChange = (key, index) => (e) => {
    const newData = [...masterField];
    newData[index][key] = e;
    setMasterField(newData);
  };

  const onCheckboxChange = (key, index) => (e) => {
    const newData = [...masterField];
    newData[index][key] = e.target.checked;
    if (key === 'is_ocr' && e.target.checked) {
      if (newData[index]['is_variable']) {
        newData[index]['default_value'] = '';
      }
      newData[index]['is_variable'] = false;
    }
    if (key === 'is_variable') {
      newData[index]['default_value'] = '';
    }
    setMasterField(newData);
  };

  const onSwitchChange = (key, index) => (e) => {
    const newData = [...masterField];
    console.log(e);
    newData[index][key] = e;
    setMasterField(newData);
  };

  const onDatePickerChange = (key, index) => (e) => {
    const newData = [...masterField];
    if (e) {
      newData[index][key] = moment(e).format(dateFormat);
    } else {
      newData[index][key] = '';
    }
    setMasterField(newData);
  };

  const onApproverSearch = (value) => {
    setApprover([]);
    setFetching(true);
    if (value) {
      if (userProfile.bu === 'SCGC') {
        fetch(value, (data) => setApprover(data));
      } else {
        fetchDbApprover(value, (data) => setApprover(data));
      }
    } else {
      setApprover([]);
    }
    setFetching(false);
  };

  const onApproverChange = (key, index) => (e) => {
    const newData = [...masterField];
    newData[index][key] = e;
    setMasterField(newData);
  };

  const onRequestorSearch = (value) => {
    setRequestor([]);
    setFetching(true);
    if (value) {
      if (userProfile.bu === 'SCGC') {
        fetch(value, (data) => setRequestor(data));
      } else {
        fetchDbRequester(value, (data) => setRequestor(data));
      }
    } else {
      setRequestor([]);
    }
    setFetching(false);
  };

  const onRequestorChange = (key, index) => (e) => {
    const newData = [...masterField];
    newData[index][key] = e;
    setMasterField(newData);
  };

  const onReviewerSearch = (value) => {
    setReviewer([]);
    setFetching(true);
    if (value) {
      if (userProfile.bu === 'SCGC') {
        fetch(value, (data) => setReviewer(data));
      } else {
        fetchDbReviewer(value, (data) => setReviewer(data));
      }
    } else {
      setReviewer([]);
    }
    setFetching(false);
  };

  const onReviewerChange = (key, index) => (e) => {
    const newData = [...masterField];
    newData[index][key] = e;
    setMasterField(newData);
  };

  const onCCSearch = (value) => {
    setCC([]);
    setFetching(true);
    if (value) {
      if (userProfile.bu === 'SCGC') {
        fetch(value, (data) => setCC(data));
      } else {
        fetchDbReviewer(value, (data) => setCC(data));
      }
    } else {
      setCC([]);
    }
    setFetching(false);
  };

  const onCCChange = (key, index) => (e) => {
    const newData = [...masterField];
    newData[index][key] = e;
    setMasterField(newData);
  };

  const onVendorChange = (value) => {
    getBeneficiariesListByVendorCode(value, null).then((result) => {
      setBeneficiary(result);
    });
  };

  const onSelectNumberStyleIdChange = (value) => {
    setNumberStyleId(value);
  };

  const onSelectCompanyChange = (key, index) => (e) => {
    setFetching(true);
    // setGrApprovalFor([]);
    // setPaymentType([]);
    // setPaymentLocation([]);
    const newData = [...masterField];
    newData[index][key] = e;

    // GR Approval For
    const indexGrApprovalFor = newData.findIndex(
      (item) => item.display_name === fieldName.grApprovalFor,
    );
    if (indexGrApprovalFor !== -1) {
      newData[indexGrApprovalFor][key] = '';
    }

    // Payment Type
    const indexPaymentType = newData.findIndex(
      (item) => item.display_name === fieldName.paymentType,
    );
    if (indexPaymentType !== -1) {
      newData[indexPaymentType][key] = '';
    }

    // Payment Location
    const indexPaymentLocation = newData.findIndex(
      (item) => item.display_name === fieldName.paymentLocation,
    );
    if (indexPaymentLocation !== -1) {
      newData[indexPaymentLocation][key] = '';
      newData[indexPaymentLocation]['is_display'] = false;
    }

    setMasterField(newData);

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

      getBeneficiariesListByVendorCode(form.getFieldValue('vendor_code'), e).then((result) => {
        setBeneficiary(result);
      });
    }
  };

  const onSelectPaymentTypeChange = (key, index) => (e) => {
    setFetching(true);
    setPaymentLocation([]);
    const newData = [...masterField];
    newData[index][key] = e;

    // Payment Location
    const indexPaymentLocation = newData.findIndex(
      (item) => item.display_name === fieldName.paymentLocation,
    );
    if (indexPaymentLocation !== -1) {
      newData[indexPaymentLocation][key] = '';
    }

    // Company
    var company_code = undefined;
    const indexCompanyCode = newData.findIndex((item) => item.display_name === fieldName.company);
    if (indexCompanyCode !== -1) {
      company_code = newData[indexCompanyCode][key];
    }

    if (
      e === undefined ||
      company_code === undefined ||
      company_code === '' ||
      company_code === null
    ) {
      if (indexPaymentLocation !== -1) {
        newData[indexPaymentLocation]['is_display'] = false;
      }
      setFetching(false);
    } else {
      getPaymentLocationsListByPaymentTypeCodeCompanyCode(e, company_code).then((data) => {
        setPaymentLocation(data);
        if (data) {
          if (indexPaymentLocation !== -1) {
            newData[indexPaymentLocation]['is_display'] = true;
          }
        } else {
          if (indexPaymentLocation !== -1) {
            newData[indexPaymentLocation]['is_display'] = false;
          }
        }
        setFetching(false);
      });
    }
    setMasterField(newData);
  };

  const onSelectVatRateChange = (key, index) => (e) => {
    const newData = [...masterField];
    newData[index][key] = e;

    const indexVatBaseTotalAmount = newData.findIndex(
      (item) => item.display_name === fieldName.vatBaseTotalAmount,
    );
    if (indexVatBaseTotalAmount !== -1) {
      if (e === '0') {
        newData[indexVatBaseTotalAmount]['is_requirefield'] = 'N';
      } else {
        newData[indexVatBaseTotalAmount]['is_requirefield'] = 'Y';
        newData[indexVatBaseTotalAmount]['is_display'] = true;
      }
    }

    setMasterField(newData);
  };

  const onSelectWhtRateChange = (key, index, display_name) => (value) => {
    const newData = [...masterField];
    newData[index][key] = value;
    let whtBaseTotalAmount = null;
    switch (display_name) {
      case fieldName.whtRate:
        whtBaseTotalAmount = fieldName.whtBaseTotalAmount;
        break;
      case fieldName.wht2Rate:
        whtBaseTotalAmount = fieldName.wht2BaseTotalAmount;
        break;
      case fieldName.wht3Rate:
        whtBaseTotalAmount = fieldName.wht3BaseTotalAmount;
        break;
      case fieldName.wht4Rate:
        whtBaseTotalAmount = fieldName.wht4BaseTotalAmount;
        break;
      case fieldName.wht5Rate:
        whtBaseTotalAmount = fieldName.wht5BaseTotalAmount;
        break;
    }
    const indexWhtBaseTotalAmount = newData.findIndex(
      (item) => item.display_name === whtBaseTotalAmount,
    );
    if (indexWhtBaseTotalAmount !== -1) {
      if (value === '0') {
        newData[indexWhtBaseTotalAmount]['is_requirefield'] = 'N';
      } else if (
        value === undefined &&
        [fieldName.wht2Rate, fieldName.wht3Rate, fieldName.wht4Rate, fieldName.wht5Rate].includes(
          display_name,
        )
      ) {
        newData[indexWhtBaseTotalAmount]['is_requirefield'] = 'N';
      } else {
        newData[indexWhtBaseTotalAmount]['is_requirefield'] = 'Y';
        newData[indexWhtBaseTotalAmount]['is_display'] = true;
      }
    }

    setMasterField(newData);
  };

  // Get master data for each fields
  function getMasterDataForEachFields() {
    getMasterDataItemsByMasterDataId(masterdata_id).then((response) => {
      const indexForeignPayment = response.findIndex(
        (item) => item.display_name === fieldName.foreignPayment,
      );
      if (indexForeignPayment !== -1) {
        response[indexForeignPayment]['default_value'] =
          response[indexForeignPayment]['default_value'] === 'true' ? true : false;
      }

      // VAT Base Total Amount
      const indexVatBaseTotalAmount = response.findIndex(
        (item) => item.display_name === fieldName.vatBaseTotalAmount,
      );
      const indexVatRate = response.findIndex((item) => item.display_name === fieldName.vatRate);
      if (indexVatBaseTotalAmount !== -1 && indexVatRate !== -1) {
        if (response[indexVatRate]['default_value'] === '0') {
          response[indexVatBaseTotalAmount]['is_requirefield'] = 'N';
        } else {
          response[indexVatBaseTotalAmount]['is_requirefield'] = 'Y';
          response[indexVatBaseTotalAmount]['is_display'] = true;
        }
      }

      // WHT Base Total Amount
      const indexWhtBaseTotalAmount = response.findIndex(
        (item) => item.display_name === fieldName.whtBaseTotalAmount,
      );
      const indexWhtRate = response.findIndex((item) => item.display_name === fieldName.whtRate);
      if (indexWhtBaseTotalAmount !== -1 && indexWhtRate !== -1) {
        if (response[indexWhtRate]['default_value'] === '0') {
          response[indexWhtBaseTotalAmount]['is_requirefield'] = 'N';
        } else {
          response[indexWhtBaseTotalAmount]['is_requirefield'] = 'Y';
          response[indexWhtBaseTotalAmount]['is_display'] = true;
        }
      }

      // Requestor
      const indexRequestor = response.findIndex(
        (data) => data.display_name === fieldName.requestor,
      );
      const valueRequestor =
        indexRequestor === -1 ? undefined : response[indexRequestor]['default_value'];

      // Reviewer
      const indexReviewer = response.findIndex((item) => item.display_name === fieldName.reviewer);
      const valueReviewer =
        indexReviewer === -1 ? undefined : response[indexReviewer]['default_value'];

      // CC
      const indexCC = response.findIndex((item) => item.display_name === fieldName.cc);
      const valueCC = indexCC === -1 ? undefined : response[indexCC]['default_value'];

      // Approver
      const indexApprover = response.findIndex((item) => item.display_name === fieldName.approver);
      const valueApprover =
        indexApprover === -1 ? undefined : response[indexApprover]['default_value'];

      // Payment Type
      const indexPaymemtType = response.findIndex(
        (data) => data.display_name === fieldName.paymentType,
      );
      const valuePaymemtType =
        indexPaymemtType === -1 ? undefined : response[indexPaymemtType]['default_value'];

      // Comapny
      const indexCompany = response.findIndex((data) => data.display_name === fieldName.company);
      const company_code =
        indexCompany === -1 ? undefined : response[indexCompany]['default_value'];

      let newMasterField = [];
      let newMasterWHTField = [];
      response.forEach((item) => {
        if (['WHT2', 'WHT3', 'WHT4', 'WHT5'].includes(item.field_name.slice(0, 4))) {
          newMasterWHTField.push(item);
        } else {
          newMasterField.push(item);
        }
      });

      const refIndex = newMasterField.findIndex((item) => item.field_name === 'Reference1');
      if (refIndex !== -1) {
        newMasterField.splice(refIndex, 0, {
          field_id: null,
          field_name: 'WHTAction',
          display_name: 'WHT Action',
        });
      } else {
        newMasterField.push({
          field_id: null,
          field_name: 'WHTAction',
          display_name: 'WHT Action',
        });
      }

      const tempMasterWHTField = newMasterWHTField;
      tempMasterWHTField.forEach((item) => {
        if (
          ['WHT2Rate', 'WHT3Rate', 'WHT4Rate', 'WHT5Rate'].includes(item.field_name) &&
          !['', ' ', null, undefined].includes(item.default_value)
        ) {
          const addWHTField = newMasterWHTField.slice(0, 7);
          addWHTField.forEach((itemField) => {
            const indexWHTAction = newMasterField.findIndex(
              (item) => item.field_name === 'WHTAction',
            );
            if (indexWHTAction !== -1) {
              newMasterField.splice(indexWHTAction, 0, itemField);
            }
          });
          newMasterWHTField = newMasterWHTField.slice(7);
        }
      });
      setMasterField(newMasterField);
      setMasterWHTField(newMasterWHTField);

      const documemtsList = getDocumentsList();
      const vendorsList = getVendorsList();
      const formTypesList = getFormTypesList();
      const companiesList = getCompaniesOptionList();
      const paymentTypesList =
        company_code === undefined || company_code === '' || company_code === null
          ? []
          : getPaymentTypesListByCompanyCode(company_code);
      const grApprovalForsList =
        company_code === undefined || company_code === '' || company_code === null
          ? []
          : getGRApprovalForsListByCompanyCode(company_code);
      const currenciesList = getCurrenciesList();
      const beneficiariesList = getBeneficiariesListByVendorCode(vendor_code, company_code);
      const serviceTeamsList = getServiceTeamsList();
      const taxRatesList = getTaxRatesList();
      const whtRatesList = getWhtRatesList();
      const expensesList = getExpensesList();
      const costCentersList = getCostCentersList();
      const internalOrdersList = getInternalOrdersList();
      const requestorList =
        valueRequestor === undefined || valueRequestor === '' || valueRequestor === null
          ? []
          : userProfile.bu === 'SCGC'
          ? getApproversGdcByAdAccount(valueRequestor)
          : getRequestersDbByStartWithEmail(valueRequestor);
      const reviewerList =
        valueReviewer === undefined || valueReviewer === '' || valueReviewer === null
          ? []
          : userProfile.bu === 'SCGC'
          ? getApproversGdcByAdAccount(valueReviewer)
          : getReviewersDbByStartWithEmail(valueReviewer);
      const ccList =
        valueCC === undefined || valueCC === '' || valueCC === null
          ? []
          : userProfile.bu === 'SCGC'
          ? getApproversGdcByAdAccount(valueCC)
          : getReviewersDbByStartWithEmail(valueCC);
      const approverList =
        valueApprover === undefined || valueApprover === '' || valueApprover === null
          ? []
          : userProfile.bu === 'SCGC'
          ? getApproversGdcByAdAccount(valueApprover)
          : getApproversDbByStartWithEmail(valueApprover);
      const bankChargesList = getBankChargesList();
      const paidForsList = getPaidForsList();
      const preAdvicesList = getPreAdvicesList();
      const remittedCurrenciesList = getRemittedCurrenciesList();
      const paymentLocationsList =
        valuePaymemtType === undefined ||
        valuePaymemtType === '' ||
        valuePaymemtType === null ||
        company_code === undefined ||
        company_code === '' ||
        company_code === null
          ? []
          : getPaymentLocationsListByPaymentTypeCodeCompanyCode(valuePaymemtType, company_code);
      const numberStyleList = getNumberStyleList();
      Promise.all([
        documemtsList,
        vendorsList,
        formTypesList,
        companiesList,
        paymentTypesList,
        grApprovalForsList,
        currenciesList,
        beneficiariesList,
        serviceTeamsList,
        taxRatesList,
        whtRatesList,
        expensesList,
        costCentersList,
        internalOrdersList,
        requestorList,
        reviewerList,
        ccList,
        approverList,
        bankChargesList,
        paidForsList,
        preAdvicesList,
        remittedCurrenciesList,
        paymentLocationsList,
        numberStyleList,
      ]).then((data) => {
        setDocument(data[0]);
        setVendor(data[1]);
        setFormType(data[2]);
        setCompany(data[3]);
        setPaymentType(data[4]);
        setGrApprovalFor(data[5]);
        setCurrency(data[6]);
        setBeneficiary(data[7]);
        setServiceTeam(data[8]);
        setTaxRate(data[9]);
        setWhtRate(data[10]);
        setExpense(data[11]);
        setCostCenter(data[12]);
        setInternalOrder(data[13]);
        setRequestor(data[14]);
        setReviewer(data[15]);
        setCC(data[16]);
        setApprover(data[17]);
        setBankCharge(data[18]);
        setPaidFor(data[19]);
        setPreAdvice(data[20]);
        setRemittedCurrency(data[21]);
        setPaymentLocation(data[22]);
        setNumberStyleList(data[23]);
        form.setFieldsValue({
          number_style_id: numberStyleId,
          ai_prompt: ai_prompt,
          day_auto_duedate: day_auto_duedate,
          document_code: document_code,
          vendor_code: vendor_code,
        });

        setLoading(false);
      });
    });
  }

  useEffect(() => {
    getMasterDataForEachFields();
  }, []);

  const onFinish = (values) => {
    let validateDefaultValueStatus = true
    let validateDefaultValueItem = {}
    masterField.forEach(item =>{
      if(item.default_value && item.default_value.includes("	")){
        validateDefaultValueStatus = false
        validateDefaultValueItem = item
      }
    })

    if(!validateDefaultValueStatus){
      message.error({
        content: `Failed validate default value. In : ${validateDefaultValueItem.display_name}.`,
        key: 'validatefailed',
        duration: 5,
      });
      return
    }

    setSaving(true);
    message.loading({
      content: 'Coping Master Data...',
      key: 'copyMasterDataMsg',
      duration: 0,
    });

    values.model_id = model_id;
    values.model_template_id = model_template_id;
    const createMasterField = masterField.filter(
      (item) => item.display_name !== fieldName.WHTAction,
    );
    createMasterData(values, createMasterField, 'Copy').then((res) => {
      if (res && res.status === 'success') {
        form.resetFields();
        message.success({
          content: 'Copy Master Data Successfully',
          key: 'copyMasterDataMsg',
          duration: 1,
          onClose: handleCopyModalVisible(false),
        });
        setSaving(false);
      } else if (res) {
        message.error({
          content: `Failed to Copy Master Data. Reason: ${res.message}.`,
          key: 'copyMasterDataMsg',
          duration: 2,
        });
        setSaving(false);
      } else {
        message.error({
          content: 'Failed to Copy Master Data. Reason: Unknown Error',
          key: 'copyMasterDataMsg',
          duration: 2,
        });
        setSaving(false);
      }
    });
  };

  const onReset = () => {
    setClearing(true);
    form.resetFields();
    const data = [...masterField];
    data.forEach(function (d) {
      d['default_value'] = '';
      d['is_ocr'] = false;
      d['is_variable'] = false;
      d['is_display'] = d['is_requirefield'] === 'Y' ? true : false;
    });
    setMasterField(data);
    setClearing(false);
  };

  const onClose = () => {
    handleCopyModalVisible(false);
  };

  const layout = {
    labelCol: {
      span: 3,
    },
    wrapperCol: {
      span: 20,
    },
  };

  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
  };

  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return { width, height };
  };

  const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
      const handleResize = () => setWindowDimensions(getWindowDimensions());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
  };

  const { width } = useWindowDimensions();

  return (
    <Modal
      className={styles.modal}
      style={{ top: 10, width: (65 * width) / 100, minWidth: (65 * width) / 100 }}
      bodyStyle={{
        padding: '10px',
      }}
      destroyOnClose
      maskClosable={false}
      title={<FormattedMessage id="page.modal.copyMasterDataTitle" />}
      visible={copyModalVisible}
      footer={renderFooter()}
      onCancel={() => handleCopyModalVisible()}
      centered
    >
      <Card>
        <Form {...layout} form={form} layout="horizontal" onFinish={onFinish}>
          <Form.Item
            name="document_code"
            label={intl.formatMessage({ id: 'page.modal.documentType' })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'page.modal.pleaseSelect',
                })} ${intl.formatMessage({ id: 'page.modal.documentType' })}`,
              },
            ]}
          >
            <Select
              disabled={loading}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '400px' }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({
                id: 'page.modal.select',
              })} ${intl.formatMessage({ id: 'page.modal.documentType' })}`}
              allowClear
            >
              {document && document.length > 0
                ? document.map((item) => (
                    <Option key={item.document_code} value={item.document_code}>
                      {item.document_name}
                    </Option>
                  ))
                : null}
            </Select>
          </Form.Item>

          <Form.Item
            name="vendor_code"
            label={intl.formatMessage({ id: 'page.modal.vendor' })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'page.modal.pleaseSelect',
                })} ${intl.formatMessage({ id: 'page.modal.vendor' })}`,
              },
            ]}
          >
            <Select
              disabled={loading}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              style={{ width: '400px' }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              placeholder={`${intl.formatMessage({
                id: 'page.modal.select',
              })} ${intl.formatMessage({ id: 'page.modal.vendor' })}`}
              onChange={onVendorChange}
              allowClear
            >
              {vendor && vendor.length > 0
                ? vendor.map((item) => (
                    <Option key={item.vendor_code} value={item.vendor_code}>
                      {item.vendor_name}
                    </Option>
                  ))
                : null}
            </Select>
          </Form.Item>

          <Form.Item
            name="additional_info"
            label={intl.formatMessage({ id: 'page.modal.additionalInfo' })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'page.modal.input',
                })} ${intl.formatMessage({ id: 'page.modal.additionalInfo' })}`,
              },
            ]}
          >
            <Input
              style={{ width: '400px' }}
              placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${intl.formatMessage({
                id: 'page.modal.additionalInfo',
              })}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
              disabled={loading}
            />
          </Form.Item>
          <Form.Item
            name="number_style_id"
            label={intl.formatMessage({ id: 'page.modal.numberStyle' })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'page.modal.pleaseSelect',
                })} ${intl.formatMessage({ id: 'page.modal.numberStyle' })}`,
              },
            ]}
          >
            <Select
              style={{ width: '400px' }}
              placeholder={`${intl.formatMessage({
                id: 'page.modal.select',
              })} ${intl.formatMessage({ id: 'page.modal.numberStyle' })}`}
              disabled={loading}
              onChange={onSelectNumberStyleIdChange}
              defaultValue={numberStyleId}
            >
              {numberStyleList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="ai_prompt"
            label={intl.formatMessage({ id: 'page.modal.aiPrompt' })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'page.modal.input',
                })} ${intl.formatMessage({ id: 'page.modal.aiPrompt' })}`,
              },
            ]}
          >
            <TextArea
              style={{ maxWidth: '1000px', }}
              placeholder={`${intl.formatMessage({
                id: 'page.modal.input',
              })} ${intl.formatMessage({ id: 'page.modal.aiPrompt' })}`}
              disabled={loading}
              rows={7}
              value={ai_prompt}
            />
          </Form.Item>
          <Form.Item
            name="day_auto_duedate"
            style={{ marginBottom: 10 }}
            label={intl.formatMessage({ id: 'page.modal.dayAutoDueDate' })}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({
                  id: 'page.modal.input',
                })} ${intl.formatMessage({ id: 'page.modal.dayAutoDueDate' })}`,
              },
            ]}
          >
            <InputNumber
              style={{ width: '200px' }}
              defaultValue={day_auto_duedate}
              disabled={loading}
              min = {0}
              max = {100}
              placeholder={`${intl.formatMessage({ id: 'page.modal.input' })} ${intl.formatMessage({
                id: 'page.modal.dayAutoDueDate',
              })}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            />
            <span> Day </span>
          </Form.Item>
          <Table
            rowKey="field_id"
            size="small"
            className={styles.container}
            loading={loading}
            bordered
            dataSource={loading ? null : masterField}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={false}
            rowSelection={false}
            disabled={loading}
          />

          <br />

          <Form.Item {...tailLayout}>
            <Button
              size="middle"
              type="primary"
              htmlType="submit"
              shape="round"
              disabled={loading}
              style={{
                marginTop: 16,
                marginLeft: 8,
              }}
              loading={saving}
            >
              {saving ? 'Creating' : intl.formatMessage({ id: 'page.modal.createBtn' })}
            </Button>

            <Button
              size="middle"
              htmlType="button"
              onClick={onClose}
              shape="round"
              style={{
                backgroundColor: '#ff4d4f',
                borderColor: '#ff4d4f',
                color: '#fff',
                marginLeft: 'auto',
                marginTop: 16,
                marginLeft: 8,
              }}
            >
              {intl.formatMessage({ id: 'page.modal.cancelBtn' })}
            </Button>

            <Popconfirm
              title="Are you sure？"
              okText={<FormattedMessage id="page.modal.confirmDeleteBtn" />}
              cancelText={<FormattedMessage id="page.modal.cancelDeleteBtn" />}
              onConfirm={onReset}
            >
              <Button
                size="middle"
                htmlType="button"
                shape="round"
                disabled={loading}
                style={{
                  backgroundColor: '#FFC30B',
                  borderColor: '#FFC30B',
                  marginTop: 16,
                  marginLeft: 8,
                }}
                loading={clearing}
              >
                {clearing ? 'Clearing' : intl.formatMessage({ id: 'page.modal.clearBtn' })}
              </Button>
            </Popconfirm>
          </Form.Item>
        </Form>
      </Card>
    </Modal>
  );
};

export default CopyForm;
