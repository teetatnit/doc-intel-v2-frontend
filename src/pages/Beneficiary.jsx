import React, { useState, useEffect } from 'react';
import { Form, Card, Select, message, Button, Upload, Table } from 'antd';
import { DownloadOutlined, UploadOutlined, FileAddOutlined } from '@ant-design/icons';
import moment from 'moment';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getBeneficiariesDownloadByCompanyCode, getBeneficiariesHistoryByCompanyCode, updateBeneficiariesUploadByCompanyCode } from '@/services/beneficiary'
import { getCompaniesList } from '@/services/company'
import { read as xlsxRead, utils as xlsxUtils, writeFile as xlsxWriteFile } from "xlsx";

const { Option } = Select;
const EditableTable = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(true);

  const [dataFileList, setDataFileList] = useState([]);
  const [headerFileList, setHeaderFileList] = useState([]);

  const [beneficiariesList, setBeneficiariesList] = useState([]);
  const [beneficiariesHistoryList, setBeneficiariesHistoryList] = useState([]);
  const [companyCode, setCompanyCode] = useState(undefined);
  const [companiesList, setCompaniesList] = useState([]);

  const [fileList, setFileList] = useState([]);

  const getBeneficiariess = (companyCode) => {
    setLoading(true);
    getBeneficiariesDownloadByCompanyCode(companyCode).then((data) => {
      setBeneficiariesList(data);
      setLoading(false);
    })
  }

  const getBeneficiariesHistory = (companyCode) => {
    setLoading(true);
    getBeneficiariesHistoryByCompanyCode(companyCode).then((data) => {
      setBeneficiariesHistoryList(data);
      setLoading(false);
    })
  }


  const getCompanies = () => {
    getCompaniesList().then((data) => {
      setCompaniesList(data);
      setCardLoading(false);
    })
  }


  useEffect(() => {
    getCompanies();
  }, [companyCode]);


  const handleClickUploadFile = () => {
    let validate = true
    let error = ''

    if (dataFileList.length === 0) {
      message.warning({
        content: 'Data file upload is empty !',
        key: 'updateBeneficiariesMsg',
        duration: 3,
      });
    } else if (validate) {
      // form.resetFields();
      message.loading({
        content: 'Updating beneficiaries...',
        key: 'updateBeneficiariesMsg',
        duration: 0
      });
      const updateData = {
        company_code: companyCode,
        header_list: JSON.stringify(headerFileList),
        item_list: JSON.stringify(dataFileList)
      }
      setLoading(true)

      console.log("fileList : ", fileList)
      console.log("updateData : ", updateData)
      updateBeneficiariesUploadByCompanyCode(updateData).then((res) => {
        if (res && res.status === 'success') {
          setFileList([])
          setHeaderFileList([])
          setDataFileList([])
          getBeneficiariess(companyCode);
          getBeneficiariesHistory(companyCode)
          message.success({
            content: 'Update beneficiaries successfully',
            key: 'updateBeneficiariesMsg',
            duration: 1,
          });
        } else if (res && res.status === 'warning') {
          message.warning({
            content: res.message,
            key: 'updateBeneficiariesMsg',
            duration: 3,
          });
        } else if (res) {
          message.error({
            content: `Failed to update beneficiaries. Reason: ${res.message}.`,
            key: 'updateBeneficiariesMsg',
            duration: 3
          });
        } else {
          message.error({
            content: 'Failed to update beneficiaries. Reason: Unknown Error',
            key: 'updateBeneficiariesMsg',
            duration: 2
          });
        }
        setLoading(false)
      });
    } else {
      message.error({
        content: 'Failed to update beneficiaries. Reason: Unknown Error',
        key: 'updateBeneficiariesMsg',
        duration: 2
      });
    }
  };

  const handleSelectCompany = (value) => {
    setCompanyCode(value)
    getBeneficiariess(value);
    getBeneficiariesHistory(value)
    setFileList([])
    setHeaderFileList([])
    setDataFileList([])
  }

  const handleClickDownloadFile = () => {
    try {
      const dateFormat = 'DD-MM-YYYY_HH-mm-ss';
      const dateString = moment(Date.now()).format(dateFormat)
      const outputFilename = `Beneficiary_Report_${companyCode}_${dateString}.xlsx`;
      const wb = xlsxUtils.book_new();
      const ws = xlsxUtils.json_to_sheet(beneficiariesList);
      xlsxUtils.book_append_sheet(wb, ws, "mysheet")
      xlsxWriteFile(wb, outputFilename);
    } catch (error) {
      throw Error(error);
    }
  }

  const columns = [
    {
      title: 'Company Code',
      dataIndex: 'company_code',
      key: 'company_code',
    },
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: 'Update By',
      dataIndex: 'user_update_name',
      key: 'user_update_name',
    },
    {
      title: 'Datetime',
      dataIndex: 'update_datetime',
      key: 'update_datetime',
      render: (text, record, index) => moment(text).format("DD-MM-YYYY HH:mm:ss")
    },
  ];

  const uploadProps = {
    accept: '.xlsx',
    multiple: false,
    onChange: ({ file, fileList, event }) => {
      if (file.status === 'removed') {
        setFileList([])
        setHeaderFileList([])
        setDataFileList([])
      } else if (file.status === 'uploading') {
        if (file) {
          console.log("file : ", file)
          const reader = new FileReader();
          reader.onload = (event) => {
            const data = event.target.result;
            const workbook = xlsxRead(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonHeader = xlsxUtils.sheet_to_json(worksheet, { header: 1 });
            const jsonData = xlsxUtils.sheet_to_json(worksheet);
            setDataFileList(jsonData)
            setHeaderFileList(jsonHeader[0])
          };
          reader.readAsArrayBuffer(file.originFileObj);
          setFileList([Object.assign(file, { status: 'done' })])
        }
      }
    },
    onRemove: (file) => {
      setFileList([])
      setHeaderFileList([])
      setDataFileList([])
    },
    fileList,
  }

  const formItemLayout = { labelCol: { span: 8 }, wrapperCol: { span: 16 } }
  return (
    <PageHeaderWrapper title="Beneficiary">
      <Card title="Add New Beneficiary" loading={cardLoading}>
        <Form
          form={form}
          {...formItemLayout}
          layout="horizontal"
        // onFinish={onFinish}
        >
          <Form.Item
            name="company_code"
            label="Company"
            style={{ marginBottom: 10 }}
            rules={[
              {
                required: true,
                message: 'Please input company',
              },
            ]}
          >
            <Select style={{ maxWidth: 314 }} placeholder="Please select company name." onChange={handleSelectCompany}>
              {companiesList.map(item => <Option value={item.company_code}>{item.company_name}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item
            label={"Upload File"}
          >
            {fileList.length ?
              <Button
                style={{ marginRight: 10 }}
                type="primary"
                htmlType="submit"
                icon={<UploadOutlined />}
                loading={loading}
                disabled={!companyCode}
                onClick={handleClickUploadFile}
              >
                {"Upload File"}
              </Button>
              :
              <Button
                style={{ marginRight: 10 }}
                icon={<DownloadOutlined />}
                loading={loading}
                disabled={!companyCode}
                onClick={handleClickDownloadFile}
              >
                {"Download File"}
              </Button>
            }

            <Upload {...uploadProps}>
              <Button
                style={{ marginRight: 10 }}
                type="primary"
                htmlType="upload"
                icon={<FileAddOutlined />}
                loading={loading}
                disabled={!companyCode || fileList.length}
              >
                {"Select File XLSX"}
              </Button>
            </Upload>

          </Form.Item>
        </Form>
      </Card>
      <br />
      <Card title="Beneficiary History" loading={cardLoading}>
        <Form form={form} component={false}>
          <Table
            loading={loading}
            // components={{
            //   body: {
            //     cell: EditableCell,
            //   },
            // }}
            bordered
            dataSource={beneficiariesHistoryList}
            columns={columns}
          // rowClassName="editable-row"
          // pagination={{
          //   onChange: cancel,
          // }}
          />
        </Form>
      </Card>
    </PageHeaderWrapper>

  );
};

export default EditableTable;