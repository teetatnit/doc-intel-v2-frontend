/*
Creator:            Kittichai R.
Creation date:      02/Nov/2021
*/

import React from 'react';
import { Button, Col, message, Row, Select, Spin, Upload, Input } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { FormattedMessage, formatMessage } from 'umi';
import {
  uploadTrainModelFile,
  getDocument,
  getVendorByDocumentCode, 
  getAdditionalInfoByDocumentCodeVendorCode,
  createModelTemplate,
  createTrainModelFile,
  uploadFileToAzureByModelTemplateId,
} from '../service';

const filesize = require('filesize');

const { Dragger } = Upload;
const { TextArea } = Input;

class UploadManually extends React.Component {
  state = {
    modelTemplateId: undefined,
    masterdataId: undefined,
    additionalInfoList: [],
    document: undefined,
    documentList: [],
    fileList: [],
    uploading: false,
    vendor: undefined,
    description: null,
    vendorList: [],
  };

  componentDidMount() {}

  getDisplayName() {
    const {
      document,
      documentList,
      vendor,
      vendorList,
      masterdataId,
      additionalInfoList,
    } = this.state;
    let displayName = '';
    const regex = /[^A-Z0-9]/gi;
    if (document !== undefined) {
      let index = documentList.findIndex((item) => item.value == document);
      if (index != -1) {
        displayName += documentList[index].text.replace(regex, '');
      }
    }
    if (vendor !== undefined) {
      let index = vendorList.findIndex((item) => item.value == vendor);
      if (index != -1) {
        let vendorNameList = vendorList[index].text.split(':')
        let vendorName = vendorNameList[1].replace(regex, '');
        if(vendorName.length === 0){
          vendorName = vendorNameList[0];
        }
        displayName += '-' + vendorName
      }
    }
    if (masterdataId !== undefined) {
      let index = additionalInfoList.findIndex((item) => item.value == masterdataId);
      if (index != -1) {
        if (additionalInfoList[index].text !== ' ') {
          displayName += '-' + additionalInfoList[index].text.replace(regex, '');
        }
      }
    }
    return displayName.toUpperCase();
  }

  handleUpload = async () => {
    const {
      fileList,
      document,
      vendor,
      masterdataId,
      additionalInfoList,
      description,
    } = this.state;

    const displayName = this.getDisplayName();
    this.setState({
      uploading: true,
    });

    if (masterdataId === undefined) {
      const index = additionalInfoList.findIndex((item) => item.text === ' ');
      if (index === -1) {
        message.error('Master Data Not Found');
        return;
      } else {
        this.setState({
          masterdataId: additionalInfoList[index]['value'],
        });
      }
    }

    let updateModelTemplateId = this.state.modelTemplateId;
    if (this.state.modelTemplateId === undefined) {
      var createModelTemplateRes = await createModelTemplate(
        document,
        vendor,
        masterdataId,
        displayName,
        description,
      );
      if (createModelTemplateRes && createModelTemplateRes.status === 'duplicate_masterdata_id') {
        message.error(`Duplicate Model Template.`);
        this.setState({ uploading: false });
        return;
      } else if (createModelTemplateRes && createModelTemplateRes.status === 'success') {
        if (createModelTemplateRes.recordset.length) {
          updateModelTemplateId = createModelTemplateRes.recordset[0].model_template_id;
          this.setState({ modelTemplateId: updateModelTemplateId });
        }
        message.success(`Create Model Template Successfully.`);
      } else {
        message.error(`Create Model Template failed.`);
        this.setState({ uploading: false });
        return;
      }
    }

    for (const file of fileList) {
      var uploadFileToServer = await uploadTrainModelFile(updateModelTemplateId, file);

      const fileSize = filesize(file.size, { base: 2 });

      var createTrainModelFileRes = await createTrainModelFile(
        uploadFileToServer,
        uploadFileToServer.original_name,
        fileSize,
        uploadFileToServer.localpath,
        uploadFileToServer.fullPath,
        updateModelTemplateId,
      );

      if (createTrainModelFileRes && createTrainModelFileRes.status === 'success') {
        message.success(`Upload ${uploadFileToServer.original_name} Successfully.`);
      } else {
        message.error(`Upload ${uploadFileToServer.original_name} failed.`);
      }
    }

    var uploadFileToAzureRes = await uploadFileToAzureByModelTemplateId(updateModelTemplateId);

    this.props.getModelTemplateList();

    this.setState({
      modelTemplateId: undefined,
      uploading: false,
      document: undefined,
      vendor: undefined,
      masterdataId: undefined,
      description: null,
      fileList: [],
    });
  };

  getDocumentType = () => {
    this.setState({ fetching: true });
    const { documentList } = this.state;

    if (!documentList || documentList.length <= 0) {
      getDocument().then((result) => {
        const documentData = [];
        try {
          result.forEach((r) => {
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
  };

  handleDocumentSelect = (value) => {
    this.setState({
      document: value,
      vendor: undefined,
      masterdataId: undefined,
      vendorList: [],
      additionalInfoList: [],
    });
  };

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
      masterdataId: undefined,
      additionalInfoList: [],
    });
  };

  getAdditionalInfo = () => {
    this.setState({ fetching: true });
    const { document, vendor, additionalInfoList } = this.state;

    if (!additionalInfoList || additionalInfoList.length <= 0) {
      getAdditionalInfoByDocumentCodeVendorCode(document, vendor).then(
        (result) => {
          const additionalInfoData = [];
          try {
            result.forEach((r) => {
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
        },
      );
    }
  };

  handleAdditionalInfoSelect = (value) => {
    this.setState({
      masterdataId: value,
    });
  };

  handleDescriptionChange = (event) => {
    this.setState({
      description: event.target.value,
    });
  };

  render() {
    const {
      uploading,
      fetching,
      fileList,
      document,
      vendor,
      masterdataId,
      description,
    } = this.state;
    const { Option } = Select;
    const props = {
      multiple: true,
      accept: '.pdf',
      name: 'file',
      onRemove: (file) => {
        this.setState((state) => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        if (file.type !== 'application/pdf') {
          message.error(formatMessage({ id: 'component.dragger.description' }));
          return false;
        }

        this.setState((state) => ({
          fileList: [...state.fileList, file],
        }));

        return false;
      },
      fileList,
    };

    const documentOptions = this.state.documentList.map((d) => (
      <Option key={d.value}>{d.text}</Option>
    ));
    const vendorOptions = this.state.vendorList.map((d) => (
      <Option key={d.value}>{d.text}</Option>
    ));
    const additionalInfoOptions =
      this.state.additionalInfoList && this.state.additionalInfoList.length > 0
        ? this.state.additionalInfoList.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.text}
            </Option>
          ))
        : null;

    const displayName = this.getDisplayName();
    return (
      <div>
        <div id="components-upload-demo-upload-manually">
          <Row style={{ paddingBottom: 16 }}>
            <Col
              span={12}
              style={{
                minHeight: 200,
                padding: 16,
                borderRight: '1px solid #DDD',
              }}
            >
              <Row style={{ display: 'block', height: 200 }}>
                <Dragger {...props} showUploadList={false}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    <FormattedMessage id="component.modeltemplate.dragger.title" />
                  </p>
                  <p className="ant-upload-hint">
                    <FormattedMessage id="component.modeltemplate.dragger.description.multiple" />
                  </p>
                </Dragger>
              </Row>
              <Row style={{ overflow: 'auto' }}>
                <Upload {...props} />
              </Row>
            </Col>

            <Col
              span={12}
              style={{
                minHeight: 200,
                padding: 16,
              }}
            >
              <Row
                style={{
                  marginLeft: 8,
                }}
              >
                <Col span={9}>
                  <div style={{ width: '100%' }}>Document type :</div>
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
                  <div>Vendor :</div>
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
                      placeholder={
                        <FormattedMessage id="component.selectVendor.placeholder" />
                      }
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
                <Col span={9}>Master Model :</Col>
                <Col span={15}>
                  <Select
                    disabled={!document || !vendor}
                    allowClear={true}
                    notFoundContent={fetching ? <Spin size="small" /> : null}
                    onDropdownVisibleChange={this.getAdditionalInfo}
                    onChange={this.handleAdditionalInfoSelect}
                    placeholder={
                      <FormattedMessage id="component.selectAdditionalInfo.placeholder" />
                    }
                    showSearch
                    style={{
                      width: '100%',
                      float: 'right',
                    }}
                    value={masterdataId}
                  >
                    {additionalInfoOptions}
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
                  <div style={{ width: '100%' }}>Display Name :</div>
                </Col>
                <Col span={15}>
                  <div>
                    {/* <Input value={displayName} disabled /> */}
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
                <Col span={9}>
                  <div>Description :</div>
                </Col>
                <Col span={15}>
                  <div>
                    <TextArea
                      rows={2}
                      value={description}
                      onChange={this.handleDescriptionChange}
                    />
                  </div>
                </Col>
              </Row>
              <Row justify="end" style={{ paddingTop: '100' }}>
                <Col>
                  {fileList.length < 5 && fileList.length !== 0 ? (
                    <p
                      style={{ color: 'red', paddingTop: '20px', margin: '0px' }}
                    >{`Please upload ${5 - fileList.length} more file.`}</p>
                  ) : null}
                </Col>
                <Col>
                  <Button
                    type="primary"
                    shape="round"
                    icon={<UploadOutlined />}
                    onClick={this.handleUpload}
                    disabled={
                      fileList.length < 5 || document === undefined || vendor === undefined
                    }
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
          </Row>
        </div>
      </div>
    );
  }
}

export default UploadManually;
