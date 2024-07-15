/*
Creator:            Chanakan C.
Creation date:      22/Apr/2021

Revisor:            Supawit N.
Revision date:      07/Jun/2024
Revision Reason:    Add ExtractDataAI
*/

import React from 'react';
import { Button, Checkbox, Col, message, Modal, Row, Select, Spin, Upload, Input } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { FormattedMessage, formatMessage } from 'umi';
import { createFile, extractOCRFilesByAI, getDocument, getVendorByDocumentCode, getAdditionalInfoByDocumentCodeVendorCode, getDocIntelModel, getAIModel } from '../service';
import { getMasterDataByMasterDataId } from '@/services/masterData';

import reqwest from 'reqwest';
import styles from './index.less';
import SpecificPageModal from '../../ExtractData/UploadManually/specificPageModal';

const filesize = require('filesize')

const { Dragger } = Upload;
const { TextArea } = Input;

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
    aiModel: undefined,
    aiModelList: [],
    docIntel: undefined,
    docIntelList: [],
    aiPrompt: undefined,
    // defaultModelName: undefined,
    // templateDisplayName: undefined,
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
    const { fileList, document, vendor, additionalInfo, specificPageList, docIntel, aiModel, aiPrompt } = this.state;

    this.setState({
      uploading: true,
    });

    const formData = new FormData();
    for (const file of fileList) {
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
      let response_extract = await extractOCRFilesByAI(createFileRes.file_id, docIntel, aiModel, aiPrompt);

      if (response_extract && response_extract.status === true) {
          message.success(`Upload ${uploadToLocalResult.original_name} Successfully.`);
      }
      else {
        message.error(`Upload ${uploadToLocalResult.original_name} failed.`);
      }
    };

    this.setState({
      uploading: false,
    });

    this.setState({
      // additionalInfo: undefined,
      // document: undefined,
      // vendor: undefined,
      // aiModel: undefined,
      // aiPrompt: undefined,

      fileList: [],
      specificPage: false,
      specificPageFile: undefined,
      specificPageList: [],
    });
  }

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
      aiPrompt: undefined,
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
      aiPrompt: undefined,
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
      const masterDataResult = await getMasterDataByMasterDataId(value)
      const aiPrompt = masterDataResult?.data?.ai_prompt || null

      if (aiPrompt !== "" && aiPrompt !== undefined && aiPrompt !== null) {
        this.setState({
          aiPrompt: aiPrompt,
        });
      }else{
        this.setState({
          aiPrompt: 'Not found AI Prompt',
        });
      }
    } else {
      this.setState({
        aiPrompt: undefined
      });
    }

  }

  getDocIntelModelInfo = () => {
    this.setState({ fetching: true });
    const { docIntelList } = this.state;

    if (!docIntelList || docIntelList.length <= 0) {
      getDocIntelModel().then((result) => {
        const docIntelData = [];
        try {
          result.forEach(r => {
            docIntelData.push({
              value: r.model_code,
              text: r.model_name
            });
          });
        } catch (error) {
          console.log(error);
        }
        this.setState({
          docIntelList: docIntelData,
          fetching: false,
        });
      });
    }
  }

  getAiModelInfo = () => {
    this.setState({ fetching: true });
    const { aiModelList } = this.state;

    if (!aiModelList || aiModelList.length <= 0) {
      getAIModel().then((result) => {
        const aiModelData = [];
        try {
          result.forEach(r => {
            aiModelData.push({
              value: r.ai_model_code,
              text: r.ai_model_name
            });
          });
        } catch (error) {
          console.log(error);
        }
        this.setState({
          aiModelList: aiModelData,
          fetching: false,
        });
      });
    }
  }
  
  handleDocIntelSelect = (value) => {
    this.setState({
      docIntel: value,
    });
  };

  handleAIModelSelect = (value) => {
    this.setState({
      aiModel: value,
    });
  };

  handleDescriptionChange = (event) => {
    this.setState({
      aiPrompt: event.target.value,
    });
  };

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
      docIntel,
      aiPrompt,
      aiModel,
      specificPage,
      specificPageModalVisible,
      // defaultModelName,
      // templateDisplayName,
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
    const aiModelOptions = this.state.aiModelList && this.state.aiModelList.length > 0 ? this.state.aiModelList.map(item => (<Option key={item.text} value={item.value}>{item.text}</Option>)) : null
    const docIntelOptions = this.state.docIntelList && this.state.docIntelList.length > 0 ? this.state.docIntelList.map(item => (<Option key={item.text} value={item.value}>{item.text}</Option>)) : null

    return (
      <Row
        style={{
          paddingBottom: 16,
        }}
      >
        <Col
          span={10}
          style={{
            height: 500,
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
          span={14}
          style={{
            minHeight: 200,
            padding: 16,
          }}
        >
          {
            fileList.length > 0 ?
            <Row
              style={{
                borderBottom: '1px solid rgb(221, 221, 221)',
                marginBottom: 16,
                paddingBottom: 16,
              }}
            >
              <Upload {...props} />
            </Row> : null
          }

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
                  disabled={uploading}
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
                  disabled={!document || uploading}
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
                disabled={!document || !vendor || uploading}
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
          <Row
            style={{
              borderTop: '1px solid rgb(221, 221, 221)',
              paddingTop: 16,
              marginTop: 16,
              marginLeft: 8,
            }}
          >
            <Col span={9}>
              Document Intelligence Model :
            </Col>
            <Col span={15}>
              <Select
                disabled={uploading}
                allowClear={true}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                onDropdownVisibleChange={this.getDocIntelModelInfo}
                onChange={this.handleDocIntelSelect}
                placeholder={<FormattedMessage id="component.selectDocumentIntel.placeholder" />}
                showSearch
                style={{
                  width: '100%',
                  float: 'right'
                }}
                value={docIntel}
              >
                {docIntelOptions}
              </Select>
            </Col>
          </Row>
          <Row
            style={{
              borderTop: '1px solid rgb(221, 221, 221)',
              paddingTop: 16,
              marginTop: 16,
              marginLeft: 8,
            }}
          >
            <Col span={9}>
              AI Model :
            </Col>
            <Col span={15}>
              <Select
                disabled={uploading}
                allowClear={true}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                onDropdownVisibleChange={this.getAiModelInfo}
                onChange={this.handleAIModelSelect}
                placeholder={<FormattedMessage id="component.selectAIModel.placeholder" />}
                showSearch
                style={{
                  width: '100%',
                  float: 'right'
                }}
                value={aiModel}
              >
                {aiModelOptions}
              </Select>
            </Col>
          </Row>
          <Row
            style={{
              marginTop: 16,
              marginLeft: 8,
            }}
          >
            <Col span={9}>
              AI Prompt :
            </Col>
            <Col span={15}>
              <div>
                <TextArea
                  disabled={!additionalInfo || uploading}
                  rows={7}
                  value={aiPrompt}
                  onChange={this.handleDescriptionChange}
                />
              </div>
            </Col>
          </Row>
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
                disabled={fileList.length === 0 || document === undefined || vendor === undefined || docIntel === undefined || aiModel === undefined || aiPrompt === undefined}
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