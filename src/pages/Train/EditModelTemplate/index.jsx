import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {
  getTrainModelByModelId,
  deleteTrainModelFileByModelFileId,
  getTrainModelFileByModelId,
  getModelByModelTemplateId,
  getMasterdatasByModelTemplateId,
  updateModelSetIsDefault,
  uploadFileToAzureByModelTemplateId,
} from '../service';

import { Button, Card, Col, Row, Spin, List, Table, Tooltip, Popconfirm, Avatar, Empty } from 'antd';
import { FilePdfOutlined, DeleteFilled, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import UploadModal from './UploadModal';

class EditModelTemplate extends React.Component {
  state = {
    loading: false,
    loadingModelListTable: false,
    loadingMasterDataListTable: false,
    isUploadModalVisible: false,
    isReloadButtonVisible: false,
    displayName: null,
    description: null,
    fileList: [],
    modelList: [],
    masterDataList: [],
    totalPageTrain: 0,
  };

  getTrainModelFile = async () => {
    this.setState({ loading: true });
    var trainingModalRes = await getTrainModelByModelId(this.props.modelTemplateId);
    let displayName = null;
    let description = null;
    if (trainingModalRes.length) {
      const trainingModal = trainingModalRes[0];
      displayName = trainingModal.display_name;
      description = trainingModal.description;
    }
    var trainingModalFileRes = await getTrainModelFileByModelId(this.props.modelTemplateId);
    let fileList = [];
    let isReloadButtonVisible = false;
    if (trainingModalFileRes.length) {
      trainingModalFileRes.map((item) => {
        if (item.status === 'azure-failed') {
          isReloadButtonVisible = true;
        }
        fileList.push(Object.assign({}, item));
      });
    }

    this.setState({
      isReloadButtonVisible: isReloadButtonVisible,
      displayName: displayName,
      description: description,
      fileList: fileList,
      loading: false,
    });
  };

  getModelList = async () => {
    this.setState({ loadingModelListTable: true });
    var responses = await getModelByModelTemplateId(this.props.modelTemplateId);
    let modelList = [];
    let totalPageTrain = 0
    if (responses.length) {
      responses.map((item) => modelList.push(Object.assign({}, item)));
      totalPageTrain = responses.reduce((temp, item) => temp + item.total_pages_train, 0);
    }
    this.setState({
      loadingModelListTable: false,
      modelList: modelList,
      totalPageTrain: totalPageTrain,
    });
  };

  getMasterDataList = async () => {
    this.setState({ loadingMasterDataListTable: true });
    var responses = await getMasterdatasByModelTemplateId(this.props.modelTemplateId);
    let masterDataList = [];
    if (responses.length) {
      responses.map((item) => masterDataList.push(Object.assign({}, item)));
    }
    this.setState({
      loadingMasterDataListTable: false,
      masterDataList: masterDataList,
    });
  };



  componentDidMount() {
    this.getTrainModelFile();
    this.getModelList();
    this.getMasterDataList();
  }

  handleFileListOnClickReupload = async () => {
    console.log('On click reload file List');
    var uploadFileToAzureRes = await uploadFileToAzureByModelTemplateId(this.props.modelTemplateId);
    console.log('uploadFileToAzureRes', uploadFileToAzureRes);
  };

  handleFileListOnClickAddFile = () => {
    console.log('On click add file List');
    this.setState({ isUploadModalVisible: true });
  };

  handleButtonBack = () => {
    this.props.handleCloseEditTrainModel();
  };

  handleButtonEditTags = () => {
    this.props.handleOpenLabelTags(this.props.modelTemplateId);
  };

  handleUploadModalOnCancel = () => {
    console.log('On cancel upload modal');
    this.setState({ isUploadModalVisible: false });
  };

  handleUploadModalOnUpload = () => {
    console.log('On upload upload modal');
    this.setState({ isUploadModalVisible: false });
    this.getTrainModelFile();
  };

  handleSetDefault = async (record) => {
    var updateRes = await updateModelSetIsDefault(record.model_id, this.props.modelTemplateId);
    this.getModelList();
    console.log('updateRes', updateRes);
  };
  renderTableCreateDatetime = (datetime) => {
    if (datetime) {
      let dateString = datetime.split('T')[0];
      let timeString = datetime.split('T')[1].slice(0, -5);
      return <p>{`${dateString} ${timeString}`}</p>;
    } else {
      return null;
    }
  };
  renderTableStatus = (status) => {
    switch (status) {
      case 'ready':
        return <p style={{ color: 'green' }}>{'Ready'}</p>;
      default:
        return <p style={{ color: 'black' }}>{status}</p>;
    }
  };


  handleDeleteFile = async (item) => {
    var deleteTrainModelFileRes = await deleteTrainModelFileByModelFileId(item.model_file_id);
    this.getTrainModelFile();
  }

  render() {
    const {
      loading,
      loadingModelListTable,
      loadingMasterDataListTable,
      isUploadModalVisible,
      isReloadButtonVisible,
      displayName,
      description,
      fileList,
      modelList,
      masterDataList,
      totalPageTrain,
    } = this.state;

    const masterDataColumns = [
      {
        title: 'Document',
        dataIndex: 'document_name',
        key: 'document_name',
      },
      {
        title: 'Vendor',
        dataIndex: 'vendor_name',
        key: 'vendor_name',
      },
      {
        title: 'Additional Info',
        dataIndex: 'additional_info',
        key: 'additional_info',
      },
      {
        title: 'Create by',
        dataIndex: 'create_user_name',
        key: 'create_user_name',
      },
      {
        title: 'Create datetime',
        dataIndex: 'create_date',
        key: 'create_date',
        render: (text, record, index) => this.renderTableCreateDatetime(text),
      }
    ];

    const modelColumns = [
      {
        title: 'Model name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Model ID',
        dataIndex: 'model_number',
        key: 'model_number',
      },
      {
        title: 'Average accuracy',
        dataIndex: 'average_model_accuracy',
        key: 'average_model_accuracy',
      },
      {
        title: 'Total pages train',
        dataIndex: 'total_pages_train',
        key: 'total_pages_train',
      },
      {
        title: 'Create datetime',
        dataIndex: 'create_datetime',
        key: 'create_datetime',
        render: (text, record, index) => this.renderTableCreateDatetime(text),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (text, record, index) => this.renderTableStatus(text),
      },
      {
        title: 'Default',
        dataIndex: 'is_default',
        key: 'is_default',
        render: (text, record, index) => {
          if (!record.is_default) {
            return (
              <Popconfirm
                title="Sure to set default ?"
                onConfirm={() => this.handleSetDefault(record)}
              >
                <Tooltip placement="bottom" title={<span>{'Set default'}</span>}>
                  <a>{'No'}</a>
                </Tooltip>
              </Popconfirm>
            );
          } else {
            return <p style={{ color: 'green' }}>{'Yes'}</p>;
          }
        },
      },
    ];
    return (
      <PageHeaderWrapper>
        <Spin spinning={loading} size="large" tip={''}>
          <Card
            style={{ marginTop: 16 }}
            title="Edit Model Template"
            extra={<span style={{ float: 'right', textAlign: 'right' }} >Total Pages Train: <span style={{ marginLeft: '2%', float: 'right', textAlign: 'right' }} ></span>{totalPageTrain}</span>}
          >
            <div className={'styles.container'}>
              <div id="components-upload-demo-upload-manually">
                <Row
                  style={{
                    paddingBottom: 16,
                  }}
                >
                  <Col
                    span={24}
                    style={{
                      minHeight: 50,
                      padding: 16,
                    }}
                  >
                    <Row
                      style={{
                        marginTop: 16,
                        marginLeft: 8,
                      }}
                    >
                      <Col span={6}>
                        <div style={{ width: '100%', fontWeight: 'bold' }}>{'Display Name :'}</div>
                      </Col>
                      <Col span={18}>
                        <div>
                          <p>{displayName}</p>
                        </div>
                      </Col>
                    </Row>
                    <Row
                      style={{
                        marginTop: 16,
                        marginLeft: 8,
                      }}
                    >
                      <Col span={6}>
                        <div style={{ fontWeight: 'bold' }}>{'Description :'}</div>
                      </Col>
                      <Col span={18}>
                        <div>
                          <p>{description}</p>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  <Col
                    span={24}
                    style={{
                      minHeight: 50,
                      padding: 16,
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '1em' }}>{'Master Data :'}</div>
                    <Table
                      size="small"
                      loading={loadingMasterDataListTable}
                      bordered
                      dataSource={loadingMasterDataListTable || !masterDataList.length ? null : masterDataList}
                      columns={masterDataColumns}
                      pagination={false}
                      rowSelection={false}
                      disabled={loadingMasterDataListTable}
                    />

                  </Col>
                  <Col
                    span={24}
                    style={{
                      minHeight: 50,
                      padding: 16,
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '1em' }}>{'Model :'}</div>
                    {loadingModelListTable || !modelList.length ?

                      <Empty
                        description={<div>
                          <p style={{ fontSize: 18, color: "#cccccc", marginBottom: 2 }}>{'Not found model.'}</p>
                          <p style={{ fontSize: 14, color: "#cccccc" }}>{'Please press "Edit Tags" button to train the model.'}</p>
                        </div>}
                      /> :
                      <Table
                        size="small"
                        loading={loadingModelListTable}
                        bordered
                        dataSource={loadingModelListTable || !modelList.length ? null : modelList}
                        columns={modelColumns}
                        pagination={false}
                        rowSelection={false}
                        disabled={loadingModelListTable}
                      />
                    }

                  </Col>
                  <Col
                    span={24}
                    style={{
                      minHeight: 50,
                      padding: 16,
                    }}
                  >

                    <List
                      header={
                        <Row justify="space-between">
                          <Col span={12}>
                            <p>{'File List'}</p>
                          </Col>
                          <Col span={12}>
                            <Row justify="end">
                              {isReloadButtonVisible ? (
                                <Col>
                                  <Button
                                    type="primary"
                                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                                    onClick={this.handleFileListOnClickReupload}
                                    size="middle"
                                    icon={<ReloadOutlined />}
                                  >
                                    {'Reupload all'}
                                  </Button>
                                </Col>
                              ) : (
                                <Col>
                                  <Button
                                    type="primary"
                                    onClick={this.handleFileListOnClickAddFile}
                                    size="middle"
                                    icon={<PlusOutlined />}
                                  >
                                    {"Add file"}
                                  </Button>
                                </Col>
                              )}
                            </Row>
                          </Col>
                        </Row>
                      }
                      dataSource={fileList}
                      bordered
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <div>{item.status !== 'azure-failed' ?
                              <p key={`success-${item.model_file_id}`} style={{ color: 'green', marginBottom: 0 }}>{'Success'}</p>
                              : <p key={`azure-failed-${item.model_file_id}`} style={{ color: 'red', marginBottom: 0 }} >{'Failed'}</p>
                            }</div>,
                            <Popconfirm
                              title="Sure to delete ?"
                              onConfirm={() => this.handleDeleteFile(item)}
                            >
                              <Tooltip placement="bottom" title={<span>{'Delete'}</span>}>
                                <div style={{ padding: '5px 8px', borderRadius: '50%', backgroundColor: '#f5f5f5' }}>
                                  <DeleteFilled style={{ fontSize: 15, color: "red" }} />
                                </div>
                              </Tooltip>
                            </Popconfirm>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar shape='circle' icon={<FilePdfOutlined />} />}
                            title={<p style={{ margin: 0, padding: 5 }}>{item.original_name}</p>}
                          />
                          <div>{item.file_size}</div>
                        </List.Item>
                      )}
                    />
                  </Col>
                  <Col
                    span={24}
                    style={{
                      minHeight: 200,
                      padding: 16,
                    }}
                  >
                    <Row style={{ paddingTop: '100' }}>
                      <Col
                        span={24}
                        style={{
                          textAlign: 'right',
                        }}
                      >
                        <Button
                          shape="round"
                          onClick={this.handleButtonBack}
                          style={{
                            marginTop: 16,
                            marginLeft: 8,
                          }}
                        >
                          {'Back'}
                        </Button>
                        <Button
                          type="primary"
                          shape="round"
                          onClick={this.handleButtonEditTags}
                          style={{
                            marginTop: 16,
                            marginLeft: 8,
                          }}
                        >
                          {'Edit Tags'}
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
          <UploadModal
            modelTemplateId={this.props.modelTemplateId}
            isModalVisible={isUploadModalVisible}
            onUpload={this.handleUploadModalOnUpload}
            onCancel={this.handleUploadModalOnCancel}
          />
        </Spin>
      </PageHeaderWrapper>
    );
  }
}
export default EditModelTemplate;
