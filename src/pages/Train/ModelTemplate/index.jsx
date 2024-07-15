import React from 'react';
import { Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getModelTemplate } from '../service';
import UploadManually from './UploadManually';
import TableModelTemplate from './TableModelTemplate';
import './index.less';

class ModelTemplate extends React.Component {
  state = {
    loading: false,
    modelTemplateList: [],
    totalPageTrain : 0,
  };

  getModelTemplateList = async (refreshing) => {
    this.setState({ loading: refreshing ? false : true });
    const modelTemplateRes = await getModelTemplate();
    const totalPageTrain = modelTemplateRes.reduce((temp, item) => temp + item.total_pages_train, 0);
    this.setState({
      modelTemplateList: modelTemplateRes,
      totalPageTrain : totalPageTrain,
      loading: false,
    });
  };

  componentDidMount() {
    this.getModelTemplateList(false);
  }

  onClickActionTableEditTags = async (record) => {
    this.props.handleOpenLabelTags(record.model_template_id);
  };

  onClickActionTableEditModelTemplate = async (record) => {
    this.props.handleOpenEditTrainModel(record.model_template_id);
  };

  render() {
    const { loading, modelTemplateList, totalPageTrain } = this.state;
    return (
      <PageHeaderWrapper>
        <Card 
        style={{ marginTop: 16 }} 
        title="Model Template Setting"
        extra={<span style={{ float: 'right', textAlign: 'right' }} >Total Pages Train: <span style={{ marginLeft: '2%', float: 'right', textAlign: 'right' }} ></span>{totalPageTrain}</span>}
        >
          <UploadManually getModelTemplateList={() => this.getModelTemplateList(true)} />
          <TableModelTemplate
            loading={loading}
            modelTemplateList={modelTemplateList}
            onClickAction={{
              onEditTags: (record) => this.onClickActionTableEditTags(record),
              onEditModelTemplate: (record) => this.onClickActionTableEditModelTemplate(record),
            }}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ModelTemplate;
