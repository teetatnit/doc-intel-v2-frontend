import React, { useState, useEffect, useRef } from 'react';
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
  Space,
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import {
  getCostCentersRawList,
  updateCostCenters,
  createCostCenters,
  deleteCostCenters,
  activeCostCenters,
} from '@/services/costcenter';
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
  console.log('userProfile', userProfile);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

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
        error = 'Please input cost centers name';
      }

      if (validate) {
        // Call Update CostCenters
        updateCostCenters(key, row.name).then((res) => {
          if (res && res.status === 'success') {
            message.success('Update CostCenters Successfully');
          } else if (res) {
            message.error(`Failed to CostCenters. Reason: ${res.message}.`);
          } else {
            message.error('Failed to CostCenters. Reason: Unknown Error');
          }
        });
      } else {
        message.error(error);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      width: '25%',
      editable: false,
      ...getColumnSearchProps('code', 'Code'),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '45%',
      editable: true,
      ...getColumnSearchProps('name', 'Name'),
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
              title="Confirm Update this CostCenters?"
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
                title="Confirm Delete this CostCenter?"
                onConfirm={() => {
                  message.loading({
                    content: 'Deleting cost centers...',
                    key: 'deleteCostCentersMsg',
                    duration: 0,
                  });
                  deleteCostCenters(record.code).then((res) => {
                    getCostCenters();
                    if (res && res.status === 'success') {
                      message.success({
                        content: 'Delete cost centers successfully',
                        key: 'deleteCostCentersMsg',
                        duration: 1,
                      });
                    } else if (res) {
                      message.error({
                        content: `Failed to Delete cost centers. Reason: ${res.message}.`,
                        key: 'deleteCostCentersMsg',
                        duration: 2,
                      });
                    } else {
                      message.error({
                        content: 'Failed to Delete cost centers. Reason: Unknown Error',
                        key: 'deleteCostCentersMsg',
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
                title="Confirm Active this CostCenter?"
                onConfirm={() => {
                  message.loading({
                    content: 'Activating cost centers...',
                    key: 'deleteCostCentersMsg',
                    duration: 0,
                  });
                  activeCostCenters(record.code).then((res) => {
                    getCostCenters();
                    if (res && res.status === 'success') {
                      message.success({
                        content: 'Active cost centers successfully',
                        key: 'deleteCostCentersMsg',
                        duration: 1,
                      });
                    } else if (res) {
                      message.error({
                        content: `Failed to Active cost centers. Reason: ${res.message}.`,
                        key: 'deleteCostCentersMsg',
                        duration: 2,
                      });
                    } else {
                      message.error({
                        content: 'Failed to Active cost centers. Reason: Unknown Error',
                        key: 'deleteCostCentersMsg',
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

  // Get CostCenters List
  function getCostCenters() {
    setLoading(true);
    getCostCentersRawList().then((data) => {
      setData(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    getCostCenters();
  }, []);

  const onFinish = (values) => {
    let validate = true;
    let error = '';

    if (validate) {
      form2.resetFields();
      message.loading({
        content: 'Creating new cost centers...',
        key: 'createCostCentersMsg',
        duration: 0,
      });
      createCostCenters(values).then((res) => {
        if (res && res.status === 'success') {
          message.success({
            content: 'Create new cost centers successfully',
            key: 'createCostCentersMsg',
            duration: 1,
            onClose: getCostCenters,
          });
        } else if (res) {
          message.error({
            content: `Failed to Create new cost centers. Reason: ${res.message}.`,
            key: 'createCostCentersMsg',
            duration: 2,
          });
        } else {
          message.error({
            content: 'Failed to Create new cost centers. Reason: Unknown Error',
            key: 'createCostCentersMsg',
            duration: 2,
          });
        }
      });
    } else {
      message.error({
        content: 'Failed to Create new cost centers. Reason: Unknown Error',
        key: 'createCostCentersMsg',
        duration: 2,
      });
    }
  };

  return (
    <PageHeaderWrapper title="CostCenter">
      <Card title="Add New CostCenter">
        <Form form={form2} layout="inline" onFinish={onFinish} disabled>
          <Form.Item
            name="code"
            label="Code"
            rules={[
              {
                required: true,
                message: 'Please input cost centers code',
              },
            ]}
          >
            <Input placeholder="CostCenters Code" maxLength={20} disabled={!isEditable} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: 'Please input cost centers name',
              },
            ]}
          >
            <Input placeholder="CostCenters Name" maxLength={50} disabled={!isEditable} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={!isEditable}>
              Add CostCenter
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <br />
      <Card title="CostCenter List">
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
