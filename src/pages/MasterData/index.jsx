import { Button, Divider, Spin, Modal, Popconfirm, Space, Input, Tooltip, Checkbox } from 'antd';
import React, { useState, useRef } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { IntlProvider, enUSIntl } from '@ant-design/pro-table';
import CreateForm from './components/CreateForm';
import CopyForm from './components/CopyForm';
import ReviewForm from './components/ReviewForm';
import UpdateForm from './components/UpdateForm';
import { getMasterDatasListByParams, deleteMasterData, getMasterDataByMasterDataId } from '@/services/masterData';
import { upsertFavorite } from '@/services/favorite';
import Highlighter from 'react-highlight-words'
import { SearchOutlined, DeleteOutlined, CopyOutlined, EditOutlined, ZoomInOutlined, PlusOutlined } from '@ant-design/icons'
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

const TableList = () => {
  const sorter = useState('asc');
  const [loading, showLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [createModalVisible, handleCreateModalVisible] = useState(false);
  const [copyModalVisible, handleCopyModalVisible] = useState(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [reviewModalVisible, handleReviewModalVisible] = useState(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const [stepCreateFormValues, setStepCreateFormValues] = useState({});
  const [stepCopyFormValues, setStepCopyFormValues] = useState({});
  const [stepReviewFormValues, setStepReviewFormValues] = useState({});
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [masterDataId, setMasterDataId] = useState(0);
  const refSearchInput = useRef()
  const actionRef = useRef();
  const intl = useIntl();

  const getColumnSearchProps = (title, dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={refSearchInput}
          placeholder={`Search ${title}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
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
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => refSearchInput.current.select(), 100)
      }
    },
    render: text =>
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
    setSearchText(selectedKeys[0])
    setSearchedColumn(dataIndex)
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const handleCopy = () => {
    setLoadingText('Loading ...');
    showLoading(true);
    getMasterDataByMasterDataId(masterDataId).then((res) => {
      handleCopyModalVisible(true);
      setStepCopyFormValues(res.data);
      showLoading(false);
    });
  };

  const onCheckboxChange = (masterdata_id) => (e) => {
    showLoading(true);
    upsertFavorite(masterdata_id, e.target.checked).then((res) => {
      if (res.status === 'success') {
        actionRef.current.reload();
      }
      showLoading(false);
    })
  };

  const columns = [
/*
    {
      title: 'Favorite',
      dataIndex: 'create_date',
      width: '5%',
      hideInSearch: true,
      ...getColumnSearchProps('document_code', 'document_code'),
    },
    */
    {
      title: 'Favorite',
      dataIndex: 'favorite_is_active',
      width: '4%',
      align: 'center',
      render: (text, row) => {
        return <Checkbox
        checked={text}
        onChange={onCheckboxChange(row.masterdata_id)}
      />
      }
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.documentType' }),
      dataIndex: 'document_name',
      key: 'document_name',
      width: '11%',
      ...getColumnSearchProps('Document Name', 'document_name'),
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.vendor' }),
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      width: '25%',
      ...getColumnSearchProps('Vendor', 'vendor_name'),
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.additionalInfo' }),
      dataIndex: 'additional_info',
      width: '15%',
      hideInSearch: true,
      ...getColumnSearchProps('Additional Info', 'additional_info'),
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.modelTemplate' }),
      dataIndex: 'model_template',
      width: '17%',
      hideInSearch: true,
      ...getColumnSearchProps('Model Template', 'model_template'),
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.createBy' }),
      dataIndex: 'create_name',
      width: '15%',
      hideInSearch: true,
      ...getColumnSearchProps('Create By', 'create_name'),
    },
    {
      title: intl.formatMessage({ id: 'page.modal.column.action' }),
      dataIndex: 'option',
      valueType: 'option',
      width: '13%',
      render: (_, record) => (
        <>
          <Tooltip placement="topLeft" title="Review">
            <ZoomInOutlined
              onClick={() => {
                setLoadingText('Loading ...');
                showLoading(true);
                getMasterDataByMasterDataId(record.masterdata_id).then((res) => {
                  setMasterDataId(record.masterdata_id);
                  handleReviewModalVisible(true);
                  setStepReviewFormValues(res.data);
                  setStepCopyFormValues(res.data);
                  showLoading(false);
                });
              }}
            />
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip placement="topLeft" title="Copy">
            <CopyOutlined
              onClick={() => {
                setLoadingText('Loading ...');
                showLoading(true);
                getMasterDataByMasterDataId(record.masterdata_id).then((res) => {
                  handleCopyModalVisible(true);
                  setStepCopyFormValues(res.data);
                  showLoading(false);
                });
              }}
            />
          </Tooltip>

          {
            (record.create_by === userProfile.ssoAccount) &&
            (
              <>
                <Divider type="vertical" />
                <Tooltip placement="topLeft" title="Edit">
                  <EditOutlined
                    onClick={() => {
                      setLoadingText('Loading ...');
                      showLoading(true);
                      getMasterDataByMasterDataId(record.masterdata_id).then((res) => {
                        handleUpdateModalVisible(true);
                        setStepFormValues(res.data);
                        showLoading(false);
                      });
                    }}
                  />
                </Tooltip>
              </>
            )
          }

          {
            (record.create_by === userProfile.ssoAccount) &&
            (
              <>
                <Divider type="vertical" />

                <Popconfirm
                  title={<FormattedMessage id="page.modal.confirmDeleteMessage" />}
                  onConfirm={() => {
                    deleteMasterData(record.masterdata_id).then((res) => {
                      console.log(res);
                      Modal.info({
                        title: res.status,
                        content: (
                          <div>
                            {res.message}
                          </div>
                        ),
                        onOk() { actionRef.current.reload(); return false; },
                      });
                    })
                  }}
                  okText={<FormattedMessage id="page.modal.confirmDeleteBtn" />}
                  okButtonProps={{ type: 'danger', }}
                  cancelText={<FormattedMessage id="page.modal.cancelDeleteBtn" />}
                  cancelButtonProps={{ type: 'default' }}
                >
                  <Tooltip placement="topLeft" title="Delete">
                    <DeleteOutlined />
                  </Tooltip>
                </Popconfirm>

              </>
            )
          }

        </>
      ),
    },
  ];

  return (
    <Spin spinning={loading} size="large" tip={loadingText} style={{ marginTop: '50vh' }}>

      <PageHeaderWrapper>

        <Button
          type="primary"
          htmlType="submit"
          onClick={() => {
            setLoadingText('Loading ...');
            showLoading(true);
            handleCreateModalVisible(true);
            setStepCreateFormValues({ masterdata: 0 });
            showLoading(false);
          }}
          size="middle"
          icon={<PlusOutlined />}
        >
          {<FormattedMessage id="page.modal.addMasterDataTitle" />}
        </Button>

        <IntlProvider value={enUSIntl}>
          <ProTable
            actionRef={actionRef}
            rowKey={"masterdata_id"}
            params={{
              sorter,
            }}
            pagination={{
              defaultPageSize: 10,
              showTitle: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} of total ${total} items`
            }}
            request={params => getMasterDatasListByParams(params)}
            columns={columns}
            rowSelection={false}
            search={false}
            size="middle"
          />
        </IntlProvider>

        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            onSubmit={actionRef.current.reload()}
            onCancel={() => {
              handleUpdateModalVisible(false);
              setStepFormValues({});
            }}
            updateModalVisible={updateModalVisible}
            values={stepFormValues}
          />
        ) : null}

        {stepCreateFormValues && Object.keys(stepCreateFormValues).length ? (
          <CreateForm
            onSubmit={actionRef.current.reload()}
            onCancel={() => {
              handleCreateModalVisible(false);
              setStepCreateFormValues({});
            }}
            createModalVisible={createModalVisible}
            values={stepCreateFormValues}
          />
        ) : null}

        {stepCopyFormValues && Object.keys(stepCopyFormValues).length ? (
          <CopyForm
            onSubmit={actionRef.current.reload()}
            onCancel={() => {
              handleCopyModalVisible(false);
              setStepCopyFormValues({});
            }}
            copyModalVisible={copyModalVisible}
            values={stepCopyFormValues}
          />
        ) : null}

        {stepReviewFormValues && Object.keys(stepReviewFormValues).length ? (
          <ReviewForm
            onSubmit={() => {
              handleReviewModalVisible(false);
              setStepReviewFormValues({});
              handleCopy();
            }}
            onCancel={() => {
              handleReviewModalVisible(false);
              setStepReviewFormValues({});
            }}
            reviewModalVisible={reviewModalVisible}
            values={stepReviewFormValues}
          />
        ) : null}

      </PageHeaderWrapper>

    </Spin>
  );
};

export default TableList;
