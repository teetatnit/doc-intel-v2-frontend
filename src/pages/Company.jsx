import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Form,
  Card,
  Select,
  message,
  Button,
  Divider,
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {
  getCompaniesRawList,
  updateCompanies,
  createCompanies,
  deleteCompanies,
  activeCompanies,
  getBusinessUnitList,
} from '@/services/company';
import tokenManager from '@/utils/token';
const userProfile = tokenManager.decode(tokenManager.get());

const { Option } = Select;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  businessUnitList,
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editing ? (
        dataIndex === 'business_unit_name' ? (
          <Form.Item
            name="business_unit_code"
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            <Select>
              {businessUnitList.map((item) => (
                <Option value={item.business_unit_code}>{item.business_unit_name}</Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input />
          </Form.Item>
        )
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable = () => {
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [loading, setLoading] = useState(true);

  const isEditable = userProfile.currentAuthority === 'admin';
  const isEditing = (record) => record.code === editingKey;

  const [businessUnitList, setBusinessUnitList] = useState([]);

  const edit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.code);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.code);

      let validate = true;
      let error = '';
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }

      if (row.name === undefined || row.name === null || row.name === '') {
        validate = false;
        error = 'Please input company name';
      }

      if (
        row.business_unit_code === undefined ||
        row.business_unit_code === null ||
        row.business_unit_code === ''
      ) {
        validate = false;
        error = 'Please input business unit';
      }

      if (validate) {
        // Call Update Companies
        updateCompanies(key, row.name, row.business_unit_code).then((res) => {
          if (res && res.status === 'success') {
            message.success('Update Companies Successfully');
            getCompaniess();
          } else if (res) {
            message.error(`Failed to Companies. Reason: ${res.message}.`);
          } else {
            message.error('Failed to Companies. Reason: Unknown Error');
          }
        });
      } else {
        message.error(error);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const getBusinessUnitName = (code) => {
    const index = businessUnitList.findIndex((item) => item.business_unit_code === code);
    if (index !== -1) {
      return businessUnitList[index].business_unit_name;
    } else {
      return '';
    }
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      width: '20%',
      editable: false,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '30%',
      editable: true,
    },
    {
      title: 'Business Unit',
      dataIndex: 'business_unit_code',
      width: '20%',
      editable: true,
      render: (text) => getBusinessUnitName(text),
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      width: '10%',
      editable: false,
      render: (text) =>
        text === 'Y' ? (
          <p style={{ color: 'green', margin: 0, textAlign: 'center' }}>{'Yes'}</p>
        ) : (
          <p style={{ color: 'red', margin: 0, textAlign: 'center' }}>{'No'}</p>
        ),
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Popconfirm
              title="Confirm Update this Companies?"
              onConfirm={() => {
                save(record.code);
              }}
            >
              <a
                style={{
                  marginRight: 8,
                }}
              >
                Update
              </a>
            </Popconfirm>
            <a onClick={cancel}>Cancel</a>
          </span>
        ) : isEditable ? (
          <>
            <a disabled={editingKey !== ''} onClick={() => edit(record)}>
              Change
            </a>
            <Divider type="vertical" />
            {record.is_active === 'Y' ? (
              <Popconfirm
                title="Confirm Delete this Company?"
                onConfirm={() => {
                  message.loading({
                    content: 'Deleting Companies...',
                    key: 'deleteCompaniesMsg',
                    duration: 0,
                  });
                  deleteCompanies(record.code).then((res) => {
                    getCompaniess();
                    if (res && res.status === 'success') {
                      message.success({
                        content: 'Delete Companies successfully',
                        key: 'deleteCompaniesMsg',
                        duration: 1,
                      });
                    } else if (res) {
                      message.error({
                        content: `Failed to Delete Companies. Reason: ${res.message}.`,
                        key: 'deleteCompaniesMsg',
                        duration: 2,
                      });
                    } else {
                      message.error({
                        content: 'Failed to Delete Companies. Reason: Unknown Error',
                        key: 'deleteCompaniesMsg',
                        duration: 2,
                      });
                    }
                  });
                }}
              >
                <a
                  style={{
                    color: 'red',
                    marginRight: 8,
                  }}
                >
                  Delete
                </a>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Confirm Active this Company?"
                onConfirm={() => {
                  message.loading({
                    content: 'Activating Companies...',
                    key: 'deleteCompaniesMsg',
                    duration: 0,
                  });
                  activeCompanies(record.code).then((res) => {
                    getCompaniess();
                    if (res && res.status === 'success') {
                      message.success({
                        content: 'Active Companies successfully',
                        key: 'deleteCompaniesMsg',
                        duration: 1,
                      });
                    } else if (res) {
                      message.error({
                        content: `Failed to Active Companies. Reason: ${res.message}.`,
                        key: 'deleteCompaniesMsg',
                        duration: 2,
                      });
                    } else {
                      message.error({
                        content: 'Failed to Active Companies. Reason: Unknown Error',
                        key: 'deleteCompaniesMsg',
                        duration: 2,
                      });
                    }
                  });
                }}
              >
                <a
                  style={{
                    color: 'green',
                    marginRight: 8,
                  }}
                >
                  Active
                </a>
              </Popconfirm>
            )}
          </>
        ) : (
          <>
            <a disabled>Change</a>
            <Divider type="vertical" />
            <a disabled>{record.is_active === 'Y' ? 'Delete' : 'Active'}</a>
          </>
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
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  // Get Companies List
  function getCompaniess() {
    getCompaniesRawList().then((data) => {
      setData(data);
      setLoading(false);
    });
  }

  function getBusiness() {
    getBusinessUnitList().then((data) => {
      setBusinessUnitList(data);
    });
  }

  useEffect(() => {
    getCompaniess();
    getBusiness();
  }, []);

  const onFinish = (values) => {
    let validate = true;
    let error = '';

    if (validate) {
      form2.resetFields();
      message.loading({
        content: 'Creating new company...',
        key: 'createCompaniesMsg',
        duration: 0,
      });
      createCompanies(values).then((res) => {
        if (res && res.status === 'success') {
          message.success({
            content: 'Create new company successfully',
            key: 'createCompaniesMsg',
            duration: 1,
            onClose: getCompaniess,
          });
        } else if (res) {
          message.error({
            content: `Failed to Create new company. Reason: ${res.message}.`,
            key: 'createCompaniesMsg',
            duration: 2,
          });
        } else {
          message.error({
            content: 'Failed to Create new company. Reason: Unknown Error',
            key: 'createCompaniesMsg',
            duration: 2,
          });
        }
      });
    } else {
      message.error({
        content: 'Failed to Create new company. Reason: Unknown Error',
        key: 'createCompaniesMsg',
        duration: 2,
      });
    }
  };

  return (
    <PageHeaderWrapper title="Company">
      <Card title="Add New Company">
        <Form form={form2} layout="inline" onFinish={onFinish}>
          <Form.Item
            name="code"
            label="Code"
            rules={[
              {
                required: true,
                message: 'Please input company code',
              },
            ]}
          >
            <Input placeholder="Companies Code" maxLength={4} disabled={!isEditable} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: 'Please input company name',
              },
            ]}
          >
            <Input placeholder="Companies Name" maxLength={50} disabled={!isEditable} />
          </Form.Item>

          <Form.Item
            name="business_unit_code"
            label="Business Unit"
            style={{
              minWidth: 220,
            }}
            rules={[
              {
                required: true,
                message: 'Please input business unit',
              },
            ]}
          >
            <Select style={{ width: '100%' }} disabled={!isEditable}>
              {businessUnitList.map((item) => (
                <Option value={item.business_unit_code}>{item.business_unit_name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Company
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <br />
      <Card title="Company List">
        <Form form={form} component={false}>
          <Table
            rowKey="code"
            loading={loading}
            components={{
              body: {
                cell: (props) => EditableCell({ ...props, businessUnitList }),
              },
            }}
            bordered
            dataSource={data}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{
              onChange: cancel,
            }}
          />
        </Form>
      </Card>
    </PageHeaderWrapper>
  );
};

export default EditableTable;
