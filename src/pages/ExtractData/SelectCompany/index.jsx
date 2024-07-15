import React, { useEffect } from 'react';
import { Select } from 'antd';
import { getCompany } from '../service';
import styles from './index.less';

const { Option } = Select;

function onChange(value) {
  console.log(`selected ${value}`);
}

function onBlur() {
  console.log('blur');
}

function onFocus() {
  console.log('focus');
}

function onSearch(val) {
  console.log('search:', val);
}

export default () => {
  useEffect(() => {
    getCompany().then((res) => { 
      console.log(res);
    })
  }, []);

  return (
    <div className={styles.container}>
      <div id="components-select-demo-search">
        <Select
          showSearch
          style={{
            width: 230,
          }}
          placeholder="Select Company"
          optionFilterProp="children"
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onSearch={onSearch}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          <Option value="SCGChem">SCG Chemicals</Option>
          <Option value="SCGPkg">SCG Packaging</Option>
          <Option value="SCG">SCG</Option>
        </Select>
      </div>
    </div>
  );
}
