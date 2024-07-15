import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Alert } from 'antd';

export default () => (
  <PageHeaderWrapper>
    <Card>
      <Alert
        message="Under Construction"
        type="warning"
        showIcon
        banner
        style={{
          margin: -12,
          marginBottom: 24,
        }}
      />
    </Card>
  </PageHeaderWrapper>
);
