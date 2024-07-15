import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Input,
  Popconfirm,
  Form,
  Card,
  Select,
  message,
  Button,
  Divider,
  Space,
  Tooltip,
  Spin,
  Tabs,
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {
  getUsersList,
  updateUserRole,
  createUser,
  deleteUser,
  createUserWithEmail,
} from '@/services/user';
import { getCompaniesOptionList } from '@/services/company';
import { getDivisionsList } from '@/services/division';
import { getApproversGdcByStartWithName } from '@/services/approver';
import { SearchOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { FormattedMessage, useIntl } from 'umi';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

const { Option } = Select;
const { TabPane } = Tabs;
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
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          <Select>
            <Option value="A">Admin</Option>
            <Option value="U">User</Option>
          </Select>
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
  const [form3] = Form.useForm();
  const [data, setData] = useState([]);
  const [company, setCompany] = useState([]);
  const [division, setDivision] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [loading, setLoading] = useState(true);
  const isEditing = (record) => record.user_id === editingKey;
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [fetching, setFetching] = useState();
  const [user, setUser] = useState([]);
  const [name, setName] = useState('');
  const refSearchInput = useRef();
  const dropdownRef = useRef();
  const intl = useIntl();
  const [saving, setSaving] = useState(false);

  const edit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.user_id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.user_id);

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

      // Call Update User Role
      updateUserRole(key, row.role, userProfile.ssoAccount).then((res) => {
        if (res && res.status === 'success') {
          message.success('Update User Role Successfully');
        } else if (res) {
          message.error(`Failed to Update User Role. Reason: ${res.message}.`);
        } else {
          message.error('Failed to Update User Role. Reason: Unknown Error');
        }
      });
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const getColumnSearchProps = (title, dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        {(dataIndex === 'email' ||
          dataIndex === 'company_name' ||
          dataIndex === 'division_name' ||
          dataIndex === 'name') && (
          <Input
            ref={refSearchInput}
            placeholder={`Search ${title}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
        )}
        {dataIndex === 'role' && (
          <>
            <Select
              ref={dropdownRef}
              notFoundContent={null}
              placeholder={`Search ${title}`}
              onSelect={(value) => {
                setSelectedKeys(value ? [value] : []);
              }}
              onClick={() => handleRoleSelect()}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            >
              <Option value="A">Admin</Option>
              <Option value="U">User</Option>
            </Select>
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
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? dataIndex !== 'role'
          ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
          : record[dataIndex].toString().toLowerCase() === value.toLowerCase()
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (dataIndex !== 'role') {
        if (visible) {
          setTimeout(() => refSearchInput.current.select(), 100);
        }
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleRoleSelect = () => {};

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'page.modal.column.email' }),
      dataIndex: 'email',
      width: '15%',
      ...getColumnSearchProps('Email', 'email'),
      render: (text) => {
        return <span>{text + '@scg.com'}</span>;
      },
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.name' }),
      dataIndex: 'name',
      width: '25%',
      ...getColumnSearchProps('Name', 'name'),
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.company' }),
      dataIndex: 'company_name',
      width: '20%',
      ...getColumnSearchProps('Company', 'company_name'),
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.division' }),
      dataIndex: 'division_name',
      width: '20%',
      ...getColumnSearchProps('Division', 'division_name'),
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.role' }),
      dataIndex: 'role',
      width: '10%',
      editable: true,
      ...getColumnSearchProps('Role', 'role'),
      render: (text, record) => {
        return text === 'A' ? <span>Admin</span> : text === 'U' ? <span>User</span> : null;
      },
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.action' }),
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Popconfirm
              title={<FormattedMessage id="page.modal.confirmEditMessage" />}
              onConfirm={() => {
                save(record.user_id);
              }}
              okText={<FormattedMessage id="page.modal.confirmEditBtn" />}
              okButtonProps={{ type: 'danger' }}
              cancelText={<FormattedMessage id="page.modal.cancelEditBtn" />}
              cancelButtonProps={{ type: 'default' }}
            >
              <a
                style={{
                  marginRight: 8,
                }}
              >
                {<FormattedMessage id="page.modal.edit" />}
              </a>
            </Popconfirm>
            <a onClick={cancel}>{<FormattedMessage id="page.modal.cancel" />}</a>
          </span>
        ) : (
          <>
            <Tooltip placement="topLeft" title="Edit">
              <EditOutlined disabled={editingKey !== ''} onClick={() => edit(record)} />
            </Tooltip>

            <Divider type="vertical" />

            <Popconfirm
              title={<FormattedMessage id="page.modal.confirmDeleteMessage" />}
              onConfirm={() => {
                message.loading({
                  content: 'Deleting user...',
                  key: 'deleteUserMsg',
                  duration: 0,
                });
                deleteUser(record.user_id, userProfile.ssoAccount).then((res) => {
                  getUsers();
                  if (res && res.status === 'success') {
                    message.success({
                      content: 'Delete user successfully',
                      key: 'deleteUserMsg',
                      duration: 1,
                    });
                  } else if (res) {
                    message.error({
                      content: `Failed to Delete user. Reason: ${res.message}.`,
                      key: 'deleteUserMsg',
                      duration: 2,
                    });
                  } else {
                    message.error({
                      content: 'Failed to Delete user. Reason: Unknown Error',
                      key: 'deleteUserMsg',
                      duration: 2,
                    });
                  }
                });
              }}
              okText={<FormattedMessage id="page.modal.confirmDeleteBtn" />}
              okButtonProps={{ type: 'danger' }}
              cancelText={<FormattedMessage id="page.modal.cancelDeleteBtn" />}
              cancelButtonProps={{ type: 'default' }}
            >
              <Tooltip placement="topLeft" title="Delete">
                <DeleteOutlined />
              </Tooltip>
            </Popconfirm>
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
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  // Get User List
  function getUsers() {
    getUsersList().then((data) => {
      setData(data);
      setLoading(false);
    });
  }

  // Get Company List
  function getCompanies() {
    getCompaniesOptionList().then((data) => {
      setCompany(data);
      setLoading(false);
    });
  }

  // Get User List
  function getDivisions() {
    getDivisionsList().then((data) => {
      setDivision(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    getCompanies();
    getDivisions();
    getUsers();
  }, []);

  const onFinishForm2 = (values) => {
    setSaving(true);
    message.loading({
      content: 'Creating new user with "SCGC" ...',
      key: 'createUserMsg',
      duration: 0,
    });
    createUser(values, name, userProfile.ssoAccount).then((res) => {
      if (res && res.status === 'success') {
        setName('');
        setUser([]);
        message.success({
          content: 'Create new user successfully',
          key: 'createUserMsg',
          duration: 1,
          onClose: getUsers,
        });
        form2.resetFields();
        setSaving(false);
      } else if (res) {
        message.error({
          content: `Failed to Create new user. Reason: ${res.message}.`,
          key: 'createUserMsg',
          duration: 2,
        });
        setSaving(false);
      } else {
        message.error({
          content: 'Failed to Create new user. Reason: Unknown Error',
          key: 'createUserMsg',
          duration: 2,
        });
        setSaving(false);
      }
    });
  };

  const onFinishForm3 = (values) => {
    setSaving(true);
    message.loading({
      content: 'Creating new user with "Email" ...',
      key: 'createUserMsg',
      duration: 0,
    });
    createUserWithEmail(values, userProfile.ssoAccount).then((res) => {
      if (res && res.status === 'success') {
        setName('');
        setUser([]);
        message.success({
          content: 'Create new user successfully',
          key: 'createUserMsg',
          duration: 1,
          onClose: getUsers,
        });
        form3.resetFields();
        setSaving(false);
      } else if (res) {
        message.error({
          content: `Failed to Create new user. Reason: ${res.message}.`,
          key: 'createUserMsg',
          duration: 2,
        });
        setSaving(false);
      } else {
        message.error({
          content: 'Failed to Create new user. Reason: Unknown Error',
          key: 'createUserMsg',
          duration: 2,
        });
        setSaving(false);
      }
    });
  };

  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
  };

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

  const onUserSearch = (value) => {
    setFetching(true);
    if (value) {
      fetch(value, (data) => setUser(data));
    } else {
      setUser([]);
    }
    setFetching(false);
  };

  return (
    <PageHeaderWrapper title="User Management">
      <Card
        // title={<FormattedMessage id="page.modal.addNewUserTitle" />}
        title={false}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="New User with SCGC" key="1" style={{ minHeight: 300 }} disabled={saving}>
            <Form {...layout} form={form2} layout="horizontal" onFinish={onFinishForm2}>
              <Form.Item
                name="email"
                label={<FormattedMessage id="page.modal.name" />}
                rules={[
                  {
                    required: true,
                    message: `${intl.formatMessage({
                      id: 'page.modal.pleaseSelect',
                    })} ${intl.formatMessage({ id: 'page.modal.name' })}`,
                  },
                ]}
              >
                <Select
                  showSearch
                  style={{ width: '400px' }}
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  filterOption={false}
                  onSearch={onUserSearch}
                  onChange={(text, index) => {
                    setName(index.children);
                  }}
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  placeholder={`${intl.formatMessage({
                    id: 'page.modal.select',
                  })} ${intl.formatMessage({ id: 'page.modal.name' })}`}
                >
                  {user.map((item) => (
                    <Option key={item.value}>{item.text}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="company_code"
                label={<FormattedMessage id="page.modal.company" />}
                rules={[
                  {
                    required: true,
                    message: `${intl.formatMessage({
                      id: 'page.modal.pleaseSelect',
                    })} ${intl.formatMessage({ id: 'page.modal.company' })}`,
                  },
                ]}
              >
                <Select
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
                  })} ${intl.formatMessage({ id: 'page.modal.company' })}`}
                  allowClear
                >
                  {company.map((item) => (
                    <option key={item.company_code} value={item.company_code}>
                      {item.company_name}
                    </option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="division_code"
                label={<FormattedMessage id="page.modal.division" />}
                rules={[
                  {
                    required: true,
                    message: `${intl.formatMessage({
                      id: 'page.modal.pleaseSelect',
                    })} ${intl.formatMessage({ id: 'page.modal.division' })}`,
                  },
                ]}
              >
                <Select
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
                  })} ${intl.formatMessage({ id: 'page.modal.division' })}`}
                  allowClear
                >
                  {division.map((item) => (
                    <option key={item.division_code} value={item.division_code}>
                      {item.division_name}
                    </option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="role"
                label={<FormattedMessage id="page.modal.role" />}
                rules={[
                  {
                    required: true,
                    message: `${intl.formatMessage({
                      id: 'page.modal.pleaseSelect',
                    })} ${intl.formatMessage({ id: 'page.modal.role' })}`,
                  },
                ]}
              >
                <Select
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
                  })} ${intl.formatMessage({ id: 'page.modal.role' })}`}
                  allowClear
                >
                  <Option value="A">Admin</Option>
                  <Option value="U">User</Option>
                </Select>
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  shape="round"
                  style={{
                    marginTop: 16,
                    marginLeft: 8,
                  }}
                  loading={saving}
                >
                  {saving ? 'Adding User' : <FormattedMessage id="page.modal.addUserBtn" />}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="New User with Email" key="2" style={{ minHeight: 150 }}>
            <Form {...layout} form={form3} layout="horizontal" onFinish={onFinishForm3}>
              <Form.Item
                name="name"
                label={<FormattedMessage id="page.modal.name" />}
                rules={[
                  {
                    required: true,
                    message: `${intl.formatMessage({
                      id: 'page.modal.pleaseInput',
                    })} ${intl.formatMessage({ id: 'page.modal.name' })}`,
                  },
                ]}
              >
                <Input
                  style={{ width: '400px' }}
                  placeholder={`${intl.formatMessage({
                    id: 'page.modal.input',
                  })} ${intl.formatMessage({ id: 'page.modal.name' })}`}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<FormattedMessage id="page.modal.email" />}
                rules={[
                  {
                    type: 'email',
                    message: `${intl.formatMessage({
                      id: 'page.modal.email',
                    })} is not a valid email`,
                  },
                  {
                    required: true,
                    message: `${intl.formatMessage({
                      id: 'page.modal.pleaseInput',
                    })} ${intl.formatMessage({ id: 'page.modal.email' })}`,
                  },
                ]}
              >
                <Input
                  style={{ width: '400px' }}
                  placeholder={`${intl.formatMessage({
                    id: 'page.modal.input',
                  })} ${intl.formatMessage({ id: 'page.modal.email' })}`}
                />
              </Form.Item>

              <Form.Item
                name="role"
                label={<FormattedMessage id="page.modal.role" />}
                rules={[
                  {
                    required: true,
                    message: `${intl.formatMessage({
                      id: 'page.modal.pleaseSelect',
                    })} ${intl.formatMessage({ id: 'page.modal.role' })}`,
                  },
                ]}
              >
                <Select
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
                  })} ${intl.formatMessage({ id: 'page.modal.role' })}`}
                  allowClear
                >
                  <Option value="A">Admin</Option>
                  <Option value="U">User</Option>
                </Select>
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  shape="round"
                  style={{
                    marginTop: 16,
                    marginLeft: 8,
                  }}
                  loading={saving}
                >
                  {saving ? 'Adding User' : <FormattedMessage id="page.modal.addUserBtn" />}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
      <br />
      <Card title={<FormattedMessage id="page.modal.userManagementTitle" />}>
        <Form form={form} component={false}>
          <Table
            rowKey="email"
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
            size="middle"
          />
        </Form>
      </Card>
    </PageHeaderWrapper>
  );
};

export default EditableTable;
