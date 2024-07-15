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
  getBusinessUnitRawList,
  updateBusinessUnit,
  createBusinessUnit,
  deleteBusinessUnit,
  activeBusinessUnit,
} from '@/services/businessUnit';
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
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editing ? (
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
        error = 'Please input business unit name';
      }

      if (validate) {
        // Call Update BusinessUnit
        updateBusinessUnit(key, row.name).then((res) => {
          if (res && res.status === 'success') {
            message.success('Update BusinessUnit Successfully');
          } else if (res) {
            message.error(`Failed to BusinessUnit. Reason: ${res.message}.`);
          } else {
            message.error('Failed to BusinessUnit. Reason: Unknown Error');
          }
        });
      } else {
        message.error(error);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      width: '30%',
      editable: false,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '40%',
      editable: true,
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
      width: '20%',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Popconfirm
              title="Confirm Update this BusinessUnit ?"
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
                title="Confirm Delete this Business Unit ?"
                onConfirm={() => {
                  message.loading({
                    content: 'Deleting business unit...',
                    key: 'deleteBusinessUnit Msg',
                    duration: 0,
                  });
                  deleteBusinessUnit(record.code).then((res) => {
                    getBusinessUnits();
                    if (res && res.status === 'success') {
                      message.success({
                        content: 'Delete business unit successfully',
                        key: 'deleteBusinessUnit Msg',
                        duration: 1,
                      });
                    } else if (res) {
                      message.error({
                        content: `Failed to Delete business unit. Reason: ${res.message}.`,
                        key: 'deleteBusinessUnit Msg',
                        duration: 2,
                      });
                    } else {
                      message.error({
                        content: 'Failed to Delete business unit. Reason: Unknown Error',
                        key: 'deleteBusinessUnit Msg',
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
                title="Confirm Active this Business Unit ?"
                onConfirm={() => {
                  message.loading({
                    content: 'Activating business unit...',
                    key: 'deleteBusinessUnit Msg',
                    duration: 0,
                  });
                  activeBusinessUnit(record.code).then((res) => {
                    getBusinessUnits();
                    if (res && res.status === 'success') {
                      message.success({
                        content: 'Active business unit successfully',
                        key: 'deleteBusinessUnit Msg',
                        duration: 1,
                      });
                    } else if (res) {
                      message.error({
                        content: `Failed to Active business unit. Reason: ${res.message}.`,
                        key: 'deleteBusinessUnit Msg',
                        duration: 2,
                      });
                    } else {
                      message.error({
                        content: 'Failed to Active business unit. Reason: Unknown Error',
                        key: 'deleteBusinessUnit Msg',
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

  // Get BusinessUnit List
  function getBusinessUnits() {
    getBusinessUnitRawList().then((data) => {
      setData(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    getBusinessUnits();
  }, []);

  const onFinish = (values) => {
    let validate = true;
    let error = '';

    if (validate) {
      form2.resetFields();
      message.loading({
        content: 'Creating new business unit...',
        key: 'createBusinessUnitMsg',
        duration: 0,
      });
      createBusinessUnit(values).then((res) => {
        if (res && res.status === 'success') {
          message.success({
            content: 'Create new business unit successfully',
            key: 'createBusinessUnitMsg',
            duration: 1,
            onClose: getBusinessUnits,
          });
        } else if (res) {
          message.error({
            content: `Failed to Create new business unit. Reason: ${res.message}.`,
            key: 'createBusinessUnitMsg',
            duration: 2,
          });
        } else {
          message.error({
            content: 'Failed to Create new business unit. Reason: Unknown Error',
            key: 'createBusinessUnitMsg',
            duration: 2,
          });
        }
      });
    } else {
      message.error({
        content: 'Failed to Create new business unit. Reason: Unknown Error',
        key: 'createBusinessUnitMsg',
        duration: 2,
      });
    }
  };

  return (
    <PageHeaderWrapper title="Business Unit">
      <Card title="Add New Business Unit">
        <Form form={form2} layout="inline" onFinish={onFinish}>
          <Form.Item
            name="code"
            label="Code"
            rules={[
              {
                required: true,
                message: 'Please input business unit code',
              },
            ]}
          >
            <Input placeholder="BusinessUnit Code" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: 'Please input business unit name',
              },
            ]}
          >
            <Input placeholder="BusinessUnit Name" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Business Unit
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <br />
      <Card title="Business Unit List">
        <Form form={form} component={false}>
          <Table
            rowKey="code"
            loading={loading}
            components={{
              body: {
                cell: EditableCell,
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
