import { Button } from 'antd';
import React from 'react';

class EditTagsModel extends React.Component {
  componentDidMount() {
    this.handler = (event) => {
      const data = JSON.parse(event.data);
      console.log('handler : ', data);
      switch (data.event) {
        case 'CLOSE_PAGE':
          this.props.handleCloseLabelTags();
          break;
      }
    };
    window.addEventListener('message', this.handler);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handler);
  }

  render() {
    const { modelTemplateId } = this.props;
    const url = `${API_IFRAME_URL}/docintel/${modelTemplateId}?token=${sessionStorage.getItem(
      'token',
    )}`;
    return (
      <div>
        <div>
          <iframe
            style={{
              width: '100%',
              height: 'calc(100vh - 112px)',
              border: '1px solid #f0f0f0',
              borderRadius: 3,
            }}
            src={url}
          />
        </div>
      </div>
    );
  }
}
export default EditTagsModel;
