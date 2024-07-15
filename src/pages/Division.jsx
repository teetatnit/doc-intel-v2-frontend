import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Card, Select, message, Button, Divider } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getDivisionsList, updateDivisions, createDivisions, deleteDivisions } from '@/services/division'

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
  const isEditing = record => record.division_code === editingKey;

  const edit = record => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.division_code);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async key => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex(item => key === item.division_code);

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

      if (row.division_name === undefined || row.division_name === null || row.division_name === '') {
        validate = false
        error = 'Please input divisions name'
      }

      if (validate) {
        // Call Update Divisions
        updateDivisions(key, row.division_name).then((res) => {
          if (res && res.status === 'success') {
            message.success('Update Divisions Successfully');
          }
          else if (res) {
            message.error(`Failed to Divisions. Reason: ${res.message}.`);
          }
          else {
            message.error('Failed to Divisions. Reason: Unknown Error');
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
      dataIndex: 'division_code',
      width: '25%',
      editable: false,
    },
    {
      title: 'Name',
      dataIndex: 'division_name',
      width: '50%',
      editable: true,
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Popconfirm title="Confirm Update this Divisions?" onConfirm={() => { save(record.division_code) }}>
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
        ) : (
          <>
            <a disabled={editingKey !== ''} onClick={() => edit(record)}>
              Change
            </a>
            <Divider type='vertical' />
            <Popconfirm
              title="Confirm Delete this Division?"
              onConfirm={() => {
                message.loading({
                  content: 'Deleting divisions...',
                  key: 'deleteDivisionsMsg',
                  duration: 0
                });
                deleteDivisions(record.division_code).then((res) => {
                  getDivisionss();
                  if (res && res.status === 'success') {
                    message.success({
                      content: 'Delete divisions successfully',
                      key: 'deleteDivisionsMsg',
                      duration: 1
                    });
                  }
                  else if (res) {
                    message.error({
                      content: `Failed to Delete divisions. Reason: ${res.message}.`,
                      key: 'deleteDivisionsMsg',
                      duration: 2
                    });
                  }
                  else {
                    message.error({
                      content: 'Failed to Delete divisions. Reason: Unknown Error',
                      key: 'deleteDivisionsMsg',
                      duration: 2
                    });
                  }
                });
              }}
            >
              <a
                style={{
                  marginRight: 8,
                }}
              >
                Delete
              </a>
            </Popconfirm>
          </>
        );
      },
    },
  ];
  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  // Get Divisions List
  function getDivisionss() {
    getDivisionsList().then((data) => {
      setData(data);
      setLoading(false);
    })
  }

  useEffect(() => {
    getDivisionss();
  }, []);

  const onFinish = values => {
    let validate = true
    let error = ''

    if (validate) {
      form2.resetFields();
      message.loading({
        content: 'Creating new divisions...',
        key: 'createDivisionsMsg',
        duration: 0
      });
      createDivisions(values).then((res) => {
        if (res && res.status === 'success') {
          message.success({
            content: 'Create new divisions successfully',
            key: 'createDivisionsMsg',
            duration: 1,
            onClose: getDivisionss
          });
        }
        else if (res) {
          message.error({
            content: `Failed to Create new divisions. Reason: ${res.message}.`,
            key: 'createDivisionsMsg',
            duration: 2
          });
        }
        else {
          message.error({
            content: 'Failed to Create new divisions. Reason: Unknown Error',
            key: 'createDivisionsMsg',
            duration: 2
          });
        }
      });
    } else {
      message.error({
        content: 'Failed to Create new divisions. Reason: Unknown Error',
        key: 'createDivisionsMsg',
        duration: 2
      });
    }
  };

  return (
    <PageHeaderWrapper title="Division">
      <Card title="Add New Division">
        <Form
          form={form2}
          layout="inline"
          onFinish={onFinish}
        >
          <Form.Item
            name="division_code"
            label="Code"
            rules={[
              {
                required: true,
                message: 'Please input divisions code',
              },
            ]}
          >
            <Input placeholder="Divisions Code" />
          </Form.Item>

          <Form.Item
            name="division_name"
            label="Name"
            rules={[
              {
                required: true,
                message: 'Please input divisions name',
              },
            ]}
          >
            <Input placeholder="Divisions Name" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Add Division</Button>
          </Form.Item>
        </Form>
      </Card>
      <br />
      <Card title="Division List">
        <Form form={form} component={false}>
          <Table
            rowKey="division_code"
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