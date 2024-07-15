/*
Creator:            Kittichai R.
Creation date:      02/Nov/2021
*/

import React from 'react';
import { Button, Input, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

class TableModelTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.searchInput = React.createRef(null);
    this.state = {
      searchText : '',
      searchedColumn : '',
    }
  }
  

  setSearchText = (value) =>{
    this.setState({searchText : value})
  }
  setSearchedColumn = (value) =>{
    this.setState({searchedColumn : value})
  }

  

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setSearchText(selectedKeys[0]);
    this.setSearchedColumn(dataIndex);
  };
  handleReset = (clearFilters) => {
    clearFilters();
    this.setSearchText('');
  };
  
  handleClickRow = (record) => {
    this.props.onClickAction.onEditModelTemplate(record);
  };

  renderTableStatus = (status) => {
    switch (status) {
      case 'upload-success':
        return <p style={{ margin: 0, color: 'green', textAlign: 'center' }}>{'Success'}</p>;
      case 'failed-local':
      case 'failed-azure':
        return <p style={{ margin: 0, color: 'red', textAlign: 'center' }}>{'Failed'}</p>;
      default:
        return <p style={{ margin: 0, color: 'black', textAlign: 'center' }}>{status}</p>;
    }
  };

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={this.searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && this.handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) => {
      if(record[dataIndex]){
        return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
      }else{
        return false
      }
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
  render() {
    const { loading, modelTemplateList } = this.props;
    const columns = [
      {
        title: 'Template ID',
        dataIndex: 'model_template_id',
        key: 'model_template_id',
        ...this.getColumnSearchProps('model_template_id'),
      },
      {
        title: 'Display Name',
        dataIndex: 'display_name',
        key: 'display_name',
        ...this.getColumnSearchProps('display_name'),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ...this.getColumnSearchProps('description'),
      },
      {
        title: 'Total Pages Train',
        dataIndex: 'total_pages_train',
        key: 'total_pages_train',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (text, record, index) => this.renderTableStatus(text),
      },
    ];

    return (
      <div>
        <Table
          rowKey="model_template_id"
          size="small"
          loading={loading}
          bordered
          dataSource={loading || !modelTemplateList.length ? null : modelTemplateList}
          columns={columns}
          rowClassName="editable-modeltemplate-row"
          rowSelection={false}
          disabled={loading}
          pagination={{
            defaultPageSize: 10,
            showTitle: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of total ${total} items`,
          }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => this.handleClickRow(record),
            };
          }}
        />
      </div>
    );
  }
}

export default TableModelTemplate;
