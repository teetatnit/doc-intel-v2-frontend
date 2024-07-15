import React from 'react';
import { Row, Col, Upload, Button, message, Select, Card } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { FormattedMessage, formatMessage } from 'umi';
import { getOCRMaster, updateOCRMaster } from '../ListTableList/service'
import reqwest from 'reqwest';

const { Dragger } = Upload;

class UploadMasterData extends React.Component {
  state = {
    fileList: [],
    uploading: false,
    masterType: '',
    OCRDropdownList: [],
  };

  componentDidMount() {
    const { OCRDropdownList } = this.state;
    if (!OCRDropdownList || OCRDropdownList.length <= 0) {
      getOCRMaster().then((result) => { 
        const dropdownData = [];
        result.forEach(r => {
          dropdownData.push({
            value: r.code,
            text: r.display,
          });
        });
        this.setState({
          OCRDropdownList: dropdownData,
        });
      });
    }
  };

  handleUpload = () => {
    const { fileList, masterType } = this.state;
    const formData = new FormData();
    fileList.forEach(file => {
      formData.set('file', file);
      reqwest({
        url: `${API_URL}/upload`,
        method: 'post',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        processData: false,
        data: formData,
        success: (data) => {
          updateOCRMaster(data.full_path, masterType).then((res) => {
            this.setState({
              uploading: false,
            });
            if (res && res.status === true) {
              message.success(`Upload ${data.original_name} Successfully.`);
            }
            else {
              message.error(`Upload ${data.original_name} failed.`);
            }
          })
        },
        error: () => {
          this.setState({
            uploading: false,
          });
          message.error('Upload failed.');
        },
      });
    });
    this.setState({
      uploading: true,
      fileList: [],
    });
  };

  handleCompanySelect = (value) => {
    this.setState({
      masterType: value,
    });
  }

  render() {
    const { uploading, fileList, masterType } = this.state;
    const { Option } = Select;
    const props = {
      multiple: false,
      accept: ".xlsx",
      name: "file",
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          message.error(formatMessage({id: 'component.dragger.description'}));
          return false;
        }
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    const companyOptions = this.state.OCRDropdownList.map(d => <Option key={d.value}>{d.text}</Option>);

    return (
      <PageHeaderWrapper title="Master Data">
        <Card title="Upload OCR Master Data">
          <Row>
            <Col
              span={12}
              style={{
                minHeight: 200,
                padding: 16,
                borderRight: '1px solid #DDD',
              }}
            >
              <Dragger 
                {...props}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text"><FormattedMessage id="component.dragger.title" /></p>
                <p className="ant-upload-hint"><FormattedMessage id="component.dragger.description" /></p>
              </Dragger>
            </Col>
            <Col
              span={12}
              style={{
                minHeight: 200,
                padding: 16,
              }}
            >
              <Upload {...props} />
              <Select
                style={{
                  width: 230,
                }}
                placeholder={<FormattedMessage id="component.selectOCRMaster.placeholder" />}
                onSelect={this.handleCompanySelect}
              >
                {companyOptions}
              </Select>
              <Button
                type="primary"
                shape="round"
                icon={<UploadOutlined />}
                onClick={this.handleUpload}
                disabled={fileList.length === 0 || masterType === ''}
                loading={uploading}
                style={{
                  marginTop: 16,
                  marginLeft: 8,
                }}
              >
                {uploading ? 'Uploading' : `Submit ${fileList.length} file`}
              </Button>
            </Col>
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default UploadMasterData;
