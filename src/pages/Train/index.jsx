/*
Creator:            Kittichai R.
Creation date:      02/Nov/2021
*/

import { Spin } from 'antd';
import React from 'react';
import ModelTemplate from './ModelTemplate';
import EditModelTemplate from './EditModelTemplate';
import EditTagsModel from './EditTagsModel';

class HomeModelTemplate extends React.Component {
  state = {
    labelTagsVisible: false,
    editModelTemplateVisible: false,
    modelTemplateId: undefined,
  };

  handleOpenEditTrainModel(modelTemplateId) {
    this.setState({
      labelTagsVisible: false,
      editModelTemplateVisible: true,
      modelTemplateId: modelTemplateId,
    });
  }

  handleCloseEditTrainModel() {
    this.setState({
      editModelTemplateVisible: false,
      modelTemplateId: undefined,
    });
  }

  handleOpenLabelTags(modelTemplateId) {
    this.setState({
      labelTagsVisible: true,
      editModelTemplateVisible: false,
      modelTemplateId: modelTemplateId,
    });
  }

  handleCloseLabelTags() {
    this.setState({
      labelTagsVisible: false,
      editModelTemplateVisible: true,
    });
  }

  render() {
    const { labelTagsVisible, editModelTemplateVisible, modelTemplateId } = this.state;
    return (
      <Spin spinning={false} size="large" tip={''} style={{ marginTop: '50vh' }}>
        {labelTagsVisible ? (
          <EditTagsModel
            modelTemplateId={modelTemplateId}
            handleCloseLabelTags={() => this.handleCloseLabelTags()}
          />
        ) : null}
        {editModelTemplateVisible ? (
          <EditModelTemplate
            modelTemplateId={modelTemplateId}
            handleCloseEditTrainModel={() => this.handleCloseEditTrainModel()}
            handleOpenLabelTags={(modelTemplateId) => this.handleOpenLabelTags(modelTemplateId)}
          />
        ) : null}
        {!labelTagsVisible && !editModelTemplateVisible ? (
          <ModelTemplate
            handleOpenLabelTags={(modelTemplateId) => this.handleOpenLabelTags(modelTemplateId)}
            handleOpenEditTrainModel={(modelTemplateId) =>
              this.handleOpenEditTrainModel(modelTemplateId)
            }
          />
        ) : null}
      </Spin>
    );
  }
}

export default HomeModelTemplate;
