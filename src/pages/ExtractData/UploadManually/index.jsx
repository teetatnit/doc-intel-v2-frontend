/*
Creator:            Chanakan C.
Creation date:      22/Apr/2021
*/

import React from 'react';
import { Button, Checkbox, Col, message, Modal, Row, Select, Spin, Upload } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { FormattedMessage, formatMessage } from 'umi';
import { createFile, extractOCRFiles, getDocument, getVendorByDocumentCode, getAdditionalInfoByDocumentCodeVendorCode, getModelDefaultModelByMasterDataId } from '../service';
import reqwest from 'reqwest';
import styles from './index.less';
import SpecificPageModal from './specificPageModal';

const filesize = require('filesize')

const { Dragger } = Upload;

class Demo extends React.Component {
  state = {
    additionalInfo: undefined,
    additionalInfoList: [],
    document: undefined,
    documentList: [],
    fileList: [],
    pageNumber: 1,
    specificPage: false,
    specificPageFile: undefined,
    specificPageList: [],
    specificPageModalVisible: false,
    uploading: false,
    vendor: undefined,
    vendorList: [],
    zoomLevel: 1.0,
    defaultModelName: undefined,
    templateDisplayName: undefined,
  };

  componentDidMount() {

  };

  setFileAndPageList = (fileList, specificPageList) => {
    this.setState({
      fileList: fileList,
      specificPageList: specificPageList
    });
  }

  setSpecificPageModalVisible = (value) => {
    this.setState({
      specificPageModalVisible: value,
    });
  }

  handleUpload = async () => {
    const { fileList, document, vendor, additionalInfo, additionalInfoList, specificPageList } = this.state;

    this.setState({
      uploading: true,
    });

    if (additionalInfo === undefined) {
      const index = additionalInfoList.findIndex(item => item.text === ' ');
      if (index === -1) {
        message.error("Master Data Not Found");
        return;
      } else {
        this.setState({
          additionalInfo: additionalInfoList[index]["value"],
        });
      }
    }

    const formData = new FormData();
    for (const file of fileList) {
      console.log('file =', file);
      formData.set('file', file);

      var uploadToLocalResult = await reqwest({
        url: `${API_URL}/uploadocr`,
        method: 'post',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        processData: false,
        data: formData,
        /* error: () => {
          this.setState({
            uploading: false,
          });
          message.error('Upload failed.');
        }, */
      });

      const fileSize = filesize(file.size, { base: 2 });
      const index = fileList.indexOf(file);

      var createFileRes = await createFile(uploadToLocalResult, uploadToLocalResult.original_name, fileSize, uploadToLocalResult.localpath, uploadToLocalResult.fullPath, document, vendor, additionalInfo, specificPageList[index]);

      this.setState({
        uploading: false,
      });

      if (createFileRes && createFileRes.status === true) {
        message.success(`Upload ${uploadToLocalResult.original_name} Successfully.`);
      }
      else {
        message.error(`Upload ${uploadToLocalResult.original_name} failed.`);
      }
    };

    extractOCRFiles();

    this.setState({
      fileList: [],
      specificPageList: [],
    });
  };

  getDocumentType = () => {
    this.setState({ fetching: true });
    const { documentList } = this.state;

    if (!documentList || documentList.length <= 0) {
      getDocument().then((result) => {
        const documentData = [];
        try {
          result.forEach(r => {
            documentData.push({
              value: r.document_code,
              text: r.document_name,
            });
          });
        } catch (error) {
          console.log(error);
        }
        this.setState({
          documentList: documentData,
          fetching: false,
        });
      });
    }
  }

  handleDocumentSelect = (value) => {
    this.setState({
      document: value,
      vendor: undefined,
      additionalInfo: undefined,
      defaultModelName: undefined,
      templateDisplayName: undefined,
      vendorList: [],
      additionalInfoList: [],
    });
  }

  getVendor = () => {
    this.setState({ fetching: true });
    const { document, vendorList } = this.state;

    if (!vendorList || vendorList.length <= 0) {
      getVendorByDocumentCode(document).then((result) => {
        const vendorData = [];
        try {
          result.forEach(r => {
            vendorData.push({
              value: r.vendor_code,
              text: r.vendor_code + ' : ' + r.vendor_name,
            });
          });
        } catch (error) {
          console.log(error);
        }
        this.setState({
          vendorList: vendorData,
          fetching: false,
        });
      });
    }
  }

  handleVendorSelect = (value) => {
    this.setState({
      vendor: value,
      additionalInfo: undefined,
      defaultModelName: undefined,
      templateDisplayName: undefined,
      additionalInfoList: [],
    });
  }

  getAdditionalInfo = () => {
    this.setState({ fetching: true });
    const { document, vendor, additionalInfoList } = this.state;

    if (!additionalInfoList || additionalInfoList.length <= 0) {
      getAdditionalInfoByDocumentCodeVendorCode(document, vendor).then((result) => {
        const additionalInfoData = [];
        try {
          result.forEach(r => {
            additionalInfoData.push({
              value: r.masterdata_id,
              text: r.additional_info === '' ? ' ' : r.additional_info,
            });
          });
        } catch (error) {
          console.log(error);
        }
        this.setState({
          additionalInfoList: additionalInfoData,
          fetching: false,
        });
      });
    }
  }

  handleAdditionalInfoSelect = async (value) => {
    this.setState({
      additionalInfo: value,
    });
    if (value) {
      const masterDataResult = await getModelDefaultModelByMasterDataId(value)
      if (masterDataResult.data !== undefined) {
        this.setState({
          defaultModelName: masterDataResult.data.model_name,
          templateDisplayName: masterDataResult.data.model_template_display_name,
        });
      }else{
        this.setState({
          defaultModelName: undefined,
          templateDisplayName: 'Not found model template.',
        });
      }
    } else {
      this.setState({
        defaultModelName: undefined,
        templateDisplayName: undefined,
      });
    }
  }

  onSpecificPageCheckboxChange = (e) => {
    this.setState({
      specificPage: e.target.checked,
    });
  }

  render() {
    const {
      uploading,
      fetching,
      fileList,
      document,
      vendor,
      additionalInfo,
      specificPage,
      specificPageModalVisible,
      defaultModelName,
      templateDisplayName,
    } = this.state;
    const { Option } = Select;
    const props = {
      multiple: specificPage ? false : true,
      accept: ".pdf",
      name: "file",
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          const newSpecificPageList = state.specificPageList.slice();
          newFileList.splice(index, 1);
          newSpecificPageList.splice(index, 1);
          return {
            fileList: newFileList,
            specificPageList: newSpecificPageList,
          };
        });
      },
      beforeUpload: file => {
        if (file.type !== 'application/pdf') {
          message.error(formatMessage({ id: 'component.dragger.description' }));
          return false;
        }
        if (specificPage) {
          this.setState({
            specificPageFile: file,
            specificPageModalVisible: true,
          });
        } else {
          this.setState(state => ({
            fileList: [...state.fileList, file],
            specificPageList: [...state.specificPageList, []],
          }));
        }
        return false;
      },
      fileList,
    };

    const documentOptions = this.state.documentList.map(d => <Option key={d.value}>{d.text}</Option>);
    const vendorOptions = this.state.vendorList.map(d => <Option key={d.value}>{d.text}</Option>);
    const additionalInfoOptions = this.state.additionalInfoList && this.state.additionalInfoList.length > 0 ? this.state.additionalInfoList.map(item => (<Option key={item.value} value={item.value}>{item.text}</Option>)) : null

    return (
      <Row
        style={{
          paddingBottom: 16,
        }}
      >
        <Col
          span={12}
          style={{
            minHeight: 200,
            padding: 16,
            borderRight: '1px solid #DDD',
          }}
        >
          {/* ====================
          1. Upload file (Dragger)
          ==================== */}
          <Dragger
            {...props}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text"><FormattedMessage id="component.dragger.title" /></p>
            <p className="ant-upload-hint">
              {specificPage ?
                <FormattedMessage id="component.dragger.description.single" />
                : <FormattedMessage id="component.dragger.description.multiple" />}
            </p>
          </Dragger>
          <Checkbox
            onChange={this.onSpecificPageCheckboxChange}
            style={{
              marginTop: 16,
              marginLeft: 8,
            }}
          >
            {<FormattedMessage id="component.specificPage.text" />}
          </Checkbox>
        </Col>

        <Col
          span={12}
          style={{
            minHeight: 200,
            padding: 16,
          }}
        >
          <Row>
            <Upload {...props} />
          </Row>
          <Row
            style={{
              marginLeft: 8,
            }}
          >
            <Col span={9}>
              <div style={{ width: '100%' }}>
                Document type :
              </div>
            </Col>
            <Col span={15}>
              <div>
                <Select
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  onDropdownVisibleChange={this.getDocumentType}
                  onSelect={this.handleDocumentSelect}
                  placeholder={<FormattedMessage id="component.selectDocument.placeholder" />}
                  showSearch
                  style={{
                    width: '100%',
                    float: 'right',
                  }}
                  value={document}
                >
                  {documentOptions}
                </Select>
              </div>
            </Col>
          </Row>
          <Row
            style={{
              marginTop: 16,
              marginLeft: 8,
            }}
          >
            <Col span={9}>
              <div>
                Vendor :
              </div>
            </Col>
            <Col span={15}>
              <div>
                <Select
                  disabled={!document}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  onDropdownVisibleChange={this.getVendor}
                  onSelect={this.handleVendorSelect}
                  placeholder={<FormattedMessage id="component.selectVendor.placeholder" />}
                  showSearch
                  style={{
                    width: '100%',
                    float: 'right',
                  }}
                  value={vendor}
                >
                  {vendorOptions}
                </Select>
              </div>
            </Col>
          </Row>
          <Row
            style={{
              marginTop: 16,
              marginLeft: 8,
            }}
          >
            <Col span={9}>
              Master Model :
            </Col>
            <Col span={15}>
              <Select
                disabled={!document || !vendor}
                allowClear={true}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                onDropdownVisibleChange={this.getAdditionalInfo}
                onChange={this.handleAdditionalInfoSelect}
                placeholder={<FormattedMessage id="component.selectAdditionalInfo.placeholder" />}
                showSearch
                style={{
                  width: '100%',
                  float: 'right'
                }}
                value={additionalInfo}
              >
                {additionalInfoOptions}
              </Select>
            </Col>
          </Row>
          {templateDisplayName ? <Row
            style={{
              marginTop: 16,
              marginLeft: 8,
            }}
          >
            <Col span={9}>
              Display Name :
            </Col>
            <Col span={15}>
              <p style={{ margin: 0 }}>{templateDisplayName}</p>
            </Col>
          </Row> : null}
          {defaultModelName ? <Row
            style={{
              marginTop: 16,
              marginLeft: 8,
            }}
          >
            <Col span={9}>
              Model Name :
            </Col>
            <Col span={15}>
              <p style={{ margin: 0 }}>{defaultModelName}</p>
            </Col>
          </Row> : null}

          <Row style={{ paddingTop: '100' }}>
            <Col
              span={24}
              style={{
                textAlign: 'right',
              }}
            >
              <Button
                type="primary"
                shape="round"
                icon={<UploadOutlined />}
                onClick={this.handleUpload}
                disabled={fileList.length === 0 || document === undefined || vendor === undefined || defaultModelName === undefined}
                loading={uploading}
                style={{
                  marginTop: 16,
                  marginLeft: 8,
                }}
              >
                {uploading ? 'Uploading' : `Submit ${fileList.length} file(s)`}
              </Button>
            </Col>
          </Row>
        </Col>
        {specificPageModalVisible ?
          <SpecificPageModal
            setFileAndPageList={this.setFileAndPageList}
            setSpecificPageModalVisible={this.setSpecificPageModalVisible}
            values={this.state}
          />
          : null
        }
      </Row>
    );
  }
}

export default () => (
  <div className={styles.container}>
    <div id="components-upload-demo-upload-manually">
      <Demo />
    </div>
  </div>
);
