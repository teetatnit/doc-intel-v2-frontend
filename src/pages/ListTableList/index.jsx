import { DownOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Divider, Dropdown, Menu, message, Input, Tooltip, DatePicker, Spin, Radio, Modal, Popconfirm } from 'antd';
import React, { useState, useRef } from 'react'; // import { createIntl, createIntlCache } from 'react-intl'
import { FormattedMessage, useIntl } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { IntlProvider, enUSIntl } from '@ant-design/pro-table';
import moment from 'moment';
// import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import { updateRule, addRule, getPOList, getPODetailsByPOId, getFileById, getFileList, deletePOByPOId } from './service';
/**
 * @param fields
 */

import UploadManually from './UploadManually';

const handleAdd = async fields => {
  const hide = message.loading('Loading');

  try {
    await addRule({ ...fields });
    hide();
    message.success('Success');
    return true;
  } catch (error) {
    hide();
    message.error('Fail');
    return false;
  }
};
/**
 * @param fields
 */

const handleUpdate = async fields => {
  const hide = message.loading('Submitting to RPA...');

  try {
    await updateRule({
      po_id: fields.key
    });
    hide();
    message.success('Success');
    return true;
  } catch (error) {
    hide();
    message.error('Failed');
    return false;
  }
};

const saveByteArray = (reportName, byte) => {
  const blob = new Blob([byte], {type: "application/pdf"});
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  const fileName = reportName;
  link.download = fileName;
  link.click();
};

function createAndDownloadBlobFile(body, filename, extension = 'pdf') {
  const blob = new Blob([body]);
  const fileName = `${filename}.${extension}`;
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, fileName);
  } else {
    const link = document.createElement('a');
    // Browsers that support HTML5 download attribute
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

/**
 * @param selectedRows
 */

const TableList = () => {
  const [sorter, setSorter] = useState('desc');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [createModalVisible, handleModalVisible, ] = useState(false);
  const [loading, showLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [tableMode, setTableMode] = useState('PO');
  const [updateModalVisible, handleUpdateModalVisible] = useState(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef();
  const intl = useIntl();
  const { RangePicker } = DatePicker;

  const onRangePickerchange = (_, date) => {
    setStartTime(date[0])
    setEndTime(date[1])
  }
  
  const columns = [
    {
      title: 'PO No.',
      dataIndex: 'po_number',
      rules: [
        {
          required: true,
          message: 'required',
        },
      ],
      hideInSearch: true,
      render: (text, record) => (
        <a
          onClick={() => {
            setLoadingText("Loading PO Details...");
            showLoading(true);
            getPODetailsByPOId(record.po_id).then((res) => {
              setStepFormValues(res.data);
              handleUpdateModalVisible(true);
              showLoading(false);
            });            
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'create_date',
      sorter: true,
      defaultSortOrder: 'descend',
      sortDirections: ['descend', 'ascend', 'descend'],
      valueType: 'dateTimeRange',
      hideInSearch: false,
      hideInForm: false,
      renderFormItem: (item,props) => {
        return <RangePicker onChange={onRangePickerchange} />;
      },
      renderText: (text) => {
        return <span>{moment(text).utcOffset('+0000').format('DD/MM/YYYY HH:mm:ss')}</span>
      }
    },
    {
      title: 'Company',
      dataIndex: 'company_id',
      sorter: false,
      hideInForm: true,
      hideInSearch: true,
      valueEnum: {
        1: {
          text: 'Perpax'
        },
        2: {
          text: 'VSS'
        },
      },
    },
    {
      title: 'Status',
      dataIndex: 'po_status',
      hideInForm: false,
      hideInSearch: false,
      valueEnum: {
        'W': {
          text: 'Waiting for Review',
          status: 'Default',
        },
        'D': {
          text: 'Save Draft',
          status: 'Default',
        },
        'R': {
          text: 'Waiting for RPA',
          status: 'Default',
        },
        'C': {
          text: 'RPA Processing',
          status: 'Processing',
        },
        'S': {
          text: 'Success',
          status: 'Success',
        },
        'P': {
          text: 'Partial Failed',
          status: 'Warning',
        },
        'F': {
          text: 'Failed',
          status: 'Error',
        },
        'M': {
          text: 'Completed by User',
          status: 'Success',
        },
      },
    },
    {
      title: 'SAP Upload Status',
      dataIndex: 'so_remark',
      hideInSearch: true,
      hideInForm: false,
      onCell: () => {
        return {
           style: {
              whiteSpace: 'nowrap',
              maxWidth: 100,
           }
        }
     },
     render: (text) => {
       return (
        <Tooltip title={text}>
          <div style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{text}</div>
        </Tooltip>
       )
     }
    },
    {
      title: 'Action',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              setLoadingText('Loading PO Details...');
              showLoading(true);
              getPODetailsByPOId(record.po_id).then((res) => {
                handleUpdateModalVisible(true);
                setStepFormValues(res.data);
                showLoading(false);
              });            
            }}
          >
            Review
          </a>
          <Divider type="vertical" />
          <a 
            onClick={() => {
              setLoadingText("Generating PDF file...");
              showLoading(true);
              getFileById(record.file_id).then((data) => {
                createAndDownloadBlobFile(data, record.po_number, "pdf");
                showLoading(false);
              })
            }}
          >
            Download
          </a>
          {
            (record.po_status === 'W' || record.po_status === 'D' || record.po_status === 'F') && 
            (
              <>
                <Divider type="vertical" />
                <Popconfirm 
                  title="Confirm Delete this PO?"
                  onConfirm={() => {
                    deletePOByPOId(record.po_id).then((res) => {
                      Modal.info({
                        title: res.status,
                        content: (
                          <div>
                            {res.message}
                          </div>
                        ),
                        onOk() {location.reload(); return false;},
                      });
                    })
                  }}
                  okText='Delete'
                  okButtonProps={{
                    type: 'danger',
                  }}
                  cancelButtonProps={{type: 'default'}} 
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
            )
          }
        </>
      ),
    },
  ];

  const fileColumns = [
    {
      title: 'File Name',
      dataIndex: 'original_name',
      width: '30%',
      hideInSearch: true,
      ellipsis: true,
      onCell: () => {
        return {
           style: {
              whiteSpace: 'nowrap',
              maxWidth: 150,
           }
        }
     },
    },
    {
      title: 'Upload Date',
      dataIndex: 'create_date',
      width: '20%',
      sorter: true,
      defaultSortOrder: 'descend',
      sortDirections: ['descend', 'ascend', 'descend'],
      valueType: 'dateTimeRange',
      hideInSearch: false,
      hideInForm: false,
      renderFormItem: (item,props) => {
        return <RangePicker onChange={onRangePickerchange} />;
      },
      renderText: (text) => {
        return <span>{moment(text).utc().format('DD/MM/YYYY HH:mm:ss')}</span>
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        'W': {
          text: 'Waiting for OCR',
          status: 'Default',
        },
        'O': {
          text: 'OCR Processing',
          status: 'Processing',
        },
        'S': {
          text: 'Success',
          status: 'Success',
        },
        'B': {
          text: 'Partial Failed',
          status: 'Warning',
        },
        'F': {
          text: 'Failed',
          status: 'Error',
        },
      },
      width: '20%',
    },
    {
      title: 'OCR Result',
      dataIndex: 'result',
      hideInForm: false,
      hideInSearch: true,
      width: '10%',
    //   onCell: () => {
    //     return {
    //        style: {
    //           whiteSpace: 'nowrap',
    //           maxWidth: 300,
    //        }
    //     }
    //  },
     render: (text) => {
       return (
        <a onClick={()=> {
          Modal.info({
            title: 'OCR Result',
            content: (
              <div>{text}</div>
            ),
            width: 800,
            mask: true,
            maskClosable: true,
            okText: 'Close'
          });
        }}>View Details</a>
       )
     }
    },
    {
      title: 'PO Result',
      dataIndex: 'po_log',
      hideInForm: false,
      hideInSearch: true,
      width: '10%',
    //   onCell: () => {
    //     return {
    //        style: {
    //           whiteSpace: 'nowrap',
    //           maxWidth: 300,
    //        }
    //     }
    //  },
     render: (text) => {
       return text !== '-' && (
        <a onClick={()=> {
          Modal.info({
            title: 'PO Result',
            content: (
              <div>{text}</div>
            ),
            mask: true,
            maskClosable: true,
            width: 640,
            okText: 'Close'
          });
        }}>View Details</a>
       )
     }
    },
    {
      title: 'Action',
      dataIndex: 'option',
      valueType: 'option',
      width: '10%',
      render: (_, record) => (
        <>
          <a 
            onClick={() => {
              setLoadingText("Generating PDF file...");
              showLoading(true);
              getFileById(record.file_id).then((data) => {
                createAndDownloadBlobFile(data, record.po_number, "pdf");
                showLoading(false);
              })
            }}
          >
            Download
          </a>
        </>
      ),
    },
  ];

  return (
    <Spin spinning={loading} size="large" tip={loadingText} style={{ marginTop: '50vh' }}>
      <PageHeaderWrapper>
        {/* Upload Section */}
        
        <UploadManually />      
        {/* Table Section */}
        
        <IntlProvider value={enUSIntl}>
          <ProTable
            headerTitle={`${tableMode} List`}
            actionRef={actionRef}
            toolBarRender={() => [
              <span>View Mode: </span>,
              <Radio.Group value={tableMode} onChange={(e) => { setTableMode(e.target.value); actionRef.current.reload() } }>
                <Radio.Button value="PO">PO List</Radio.Button>
                <Radio.Button value="File">File List</Radio.Button>
              </Radio.Group>
            ]}
            rowKey={tableMode === 'PO' ? "po_number" : "file_id"}
            onChange={(_, _filter, _sorter) => {
              const sorterResult = _sorter;
              if (sorterResult.field && sorterResult.order) {
                setSorter(sorterResult.order.substring(0,4));
              }
            }}
            params={{
              sorter,
            }}
            pagination={{
              defaultPageSize: 10,
              showTitle: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} of total ${total} items`
            }}
            request={params => tableMode === 'PO' ? getPOList(params) : getFileList(params)}
            columns={tableMode === 'PO' ? columns : fileColumns}
            rowSelection={false}
            dateFormatter='DD/MM/YYYY HH:mm:ss'
            search={{
              searchText: <FormattedMessage id="component.table.search" />,
              resetText: <FormattedMessage id="component.table.reset" />,
              // collapsed: true,
            }}
            locale={{
              filterConfirm: 'Ok',
              filterReset: 'Clear'
            }}
            beforeSearchSubmit={params => {
              if (Object.keys(params).length === 0) {
                setStartTime('');
                setEndTime('');
                return { ...params };
              }
              return { 'startDate': startTime, 'endDate': endTime, ...params};
            }}
          />
        </IntlProvider>

        {stepFormValues && Object.keys(stepFormValues).length ? (
          <UpdateForm
            onSubmit={async value => {
              const success = await handleUpdate(value);

              if (success) {
                handleUpdateModalVisible(false);
                setStepFormValues({});

                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }
            }}
            onCancel={() => {
              handleUpdateModalVisible(false);
              setStepFormValues({});
            }}
            updateModalVisible={updateModalVisible}
            values={stepFormValues}
          />
        ) : null}
      </PageHeaderWrapper>
    </Spin>
  );
};

export default TableList;
