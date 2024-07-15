import React from 'react';
import { Row, Col, Upload, Button, message, Select } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { FormattedMessage, formatMessage } from 'umi';
import { createFile, getCompany } from '../service'
import reqwest from 'reqwest';
import styles from './index.less';

const { Dragger } = Upload;

class Demo extends React.Component {
  state = {
    fileList: [],
    uploading: false,
    company: '',
    companyList: [],
  };

  componentDidMount() {
    const { companyList } = this.state;
    if (!companyList || companyList.length <= 0) {
      getCompany().then((result) => { 
        const companyData = [];
        let id = 1;
        result.forEach(r => {
          companyData.push({
            value: id,
            text: r.name,
          });
          id+=1;
        });
        this.setState({
          companyList: companyData,
        });
      });
    }
  };

  handleUpload = () => {
    const { fileList, company } = this.state;
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
          createFile(data.original_name, data.localpath, data.full_path, company).then((res) => {
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
      company: value,
    });
  }

  render() {
    const { uploading, fileList, company } = this.state;
    const { Option } = Select;
    const props = {
      multiple: true,
      accept: ".pdf",
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
        if (file.type !== 'application/pdf') {
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

    const companyOptions = this.state.companyList.map(d => <Option key={d.value}>{d.text}</Option>);

    return (
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
            placeholder={<FormattedMessage id="component.selectCompany.placeholder" />}
            onSelect={this.handleCompanySelect}
          >
            {companyOptions}
          </Select>
          <Button
            type="primary"
            shape="round"
            icon={<UploadOutlined />}
            onClick={this.handleUpload}
            disabled={fileList.length === 0 || company === ''}
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
