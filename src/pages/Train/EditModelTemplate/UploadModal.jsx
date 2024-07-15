import React from 'react';
import {
  uploadTrainModelFile,
  createTrainModelFile,
  uploadFileToAzureByModelTemplateId,
} from '../service';

import { Modal, Button, Col, message, Row, Upload } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { FormattedMessage, formatMessage } from 'umi';

import reqwest from 'reqwest';

const filesize = require('filesize');

const { Dragger } = Upload;

class UploadModal extends React.Component {
  state = {
    loading: false,
    fileList: [],
  };

  handleUpload = async () => {
    const { fileList } = this.state;
    const { modelTemplateId } = this.props;
    this.setState({ uploading: true });

    for (const file of fileList) {
      var uploadFileToServer = await uploadTrainModelFile(modelTemplateId, file);

      const fileSize = filesize(file.size, { base: 2 });

      var createTrainModelFileRes = await createTrainModelFile(
        uploadFileToServer,
        uploadFileToServer.original_name,
        fileSize,
        uploadFileToServer.localpath,
        uploadFileToServer.fullPath,
        modelTemplateId,
      );
      if (createTrainModelFileRes && createTrainModelFileRes.status === 'success') {
        message.success(`Upload ${uploadFileToServer.original_name} Successfully.`);
      } else {
        message.error(`Upload ${uploadFileToServer.original_name} failed.`);
      }
    }

    var uploadFileToAzureRes = await uploadFileToAzureByModelTemplateId(modelTemplateId);

    this.setState({
      uploading: false,
      fileList: [],
    });
    this.props.onUpload();
  };

  handleCancel = () => {
    this.props.onCancel();
  };

  render() {
    const { uploading, fileList } = this.state;
    const { isModalVisible } = this.props;
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

    return (
      <Modal
        title="Add upload file"
        visible={isModalVisible}
        onOk={this.handleUpload}
        onCancel={this.handleCancel}
        footer={[
          <Button
            key="cancel_button"
            shape="round"
            onClick={this.handleCancel}
            disabled={uploading}
            style={{
              marginTop: 16,
              marginLeft: 8,
            }}
          >
            {'Cancel'}
          </Button>,
          <Button
            key="upload_button"
            type="primary"
            shape="round"
            icon={<UploadOutlined />}
            onClick={this.handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
            style={{
              marginTop: 16,
              marginLeft: 8,
            }}
          >
            {uploading ? 'Uploading' : `Submit ${fileList.length} file(s)`}
          </Button>,
        ]}
      >
        <div id="components-modal-upload-addmodelfiletemplate">
          <Row style={{ paddingBottom: 16 }}>
            <Col
              span={24}
              style={{
                minHeight: 200,
                padding: 16,
              }}
            >
              <Dragger {...props} showUploadList={false}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  <FormattedMessage id="component.dragger.title" />
                </p>
                <p className="ant-upload-hint">
                  <FormattedMessage id="component.dragger.description.multiple" />
                </p>
              </Dragger>
            </Col>
            <Col span={24}>
              <Upload {...props} />
            </Col>
          </Row>
        </div>
      </Modal>
    );
  }
}
export default UploadModal;
