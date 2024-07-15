import React, { useState } from 'react';
import { Table, Input, InputNumber, Select, Popconfirm, Form, Modal, Badge, Tooltip } from 'antd';
import { useIntl } from 'umi';
import { updatePOItemByPOId } from '../service'
import styles from './index.less';
import Column from 'antd/lib/table/Column';
import { checkPermissions } from '@/components/Authorized/CheckPermissions';

const originData = [];
const hightlightData = [];

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  rules,
  ...restProps
}) => {
  // const inputNode = <Input size="small" />;
  const inputNode =  dataIndex === "Remark" 
                    ? (
                        <Select 
                          mode="tags" 
                          dropdownMatchSelectWidth={false}
                        >
                          <Option key="male to male">male to male</Option>
                          <Option key="male to flat">male to flat</Option>
                        </Select>
                      )
                    : inputType === 'number' 
                    ? <InputNumber size="small" /> 
                    : <Input size="small" />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          
          style={{
            margin: 0,
          }}
          rules={rules}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable = props => {
  const [form] = Form.useForm();
  const [data, setData] = useState(props.values.items);
  const companyId = props.values.company_id;
  const po_status = props.values.po_status;
  const [editingKey, setEditingKey] = useState('');
  const isEditing = record => record.item_id === editingKey;
  const intl = useIntl();

  const edit = record => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.item_id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const validateDim = (row) => {
    let sumAllDim = 0;
    if (companyId && companyId === 1) {
      if (Number.isNaN(parseFloat(row.InternalDimension4)) && Number.isNaN(parseFloat(row.InternalDimension5)) && Number.isNaN(parseFloat(row.InternalDimension6)) ) {
        sumAllDim = (parseFloat(row.InternalDimension1 || 0) + parseFloat(row.InternalDimension2 || 0) + parseFloat(row.InternalDimension3 || 0)).toFixed(4);
      }
      else {
        sumAllDim = (parseFloat(row.InternalDimension1 || 0) + parseFloat(row.InternalDimension2 || 0) + parseFloat(row.InternalDimension3 || 0) + parseFloat(row.InternalDimension4 || 0) + parseFloat(row.InternalDimension5 || 0) + parseFloat(row.InternalDimension6 || 0)).toFixed(4);
      }
    }
    else {
      sumAllDim = (parseFloat(row.InternalDimension1 || 0) + parseFloat(row.InternalDimension2 || 0) + parseFloat(row.InternalDimension3 || 0)).toFixed(4);
    }

    const width = parseFloat(row.Width).toFixed(4);
    if (width === sumAllDim) {
      return { 'isValid': true };
    }
    if ((Number.isNaN(parseFloat(row.InternalDimension1)) && Number.isNaN(parseFloat(row.InternalDimension2)) && Number.isNaN(parseFloat(row.InternalDimension3))) || ((parseFloat(row.InternalDimension1) === 0 && parseFloat(row.InternalDimension2) === 0 && parseFloat(row.InternalDimension3) === 0))) {
      return { 'isValid': true };
    }
    return { 'isValid': false, 'sumAllDim': sumAllDim, 'Width': width};
  };

  const save = async key => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex(item => key === item.item_id);
      const POId = data[0].po_id;
      const validateDimResult = validateDim(row);

      if (!validateDimResult.isValid) {
        Modal.error({
          title: intl.formatMessage({ id: 'page.modal.invalidDim.title' }),
          content: companyId === 1 ? 
                    `${intl.formatMessage({ id: 'page.modal.invalidDim.perpaxDesc1' })} (${validateDimResult.sumAllDim}) ${intl.formatMessage({ id: 'page.modal.invalidDim.desc2' })} (${validateDimResult.Width})`
                    : 
                    `${intl.formatMessage({ id: 'page.modal.invalidDim.desc1' })} (${validateDimResult.sumAllDim}) ${intl.formatMessage({ id: 'page.modal.invalidDim.desc2' })} (${validateDimResult.Width})`
          ,okText: intl.formatMessage({ id: 'page.modal.invalidDim.okText' }),
        });
        return;
      }

      if (row.Remark) {
        if(Array.isArray(row.Remark)){
          row.Remark = row.Remark[0];
        }
      }

      if (row.Remark == null){
        row.Remark = "";
      }

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });        
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }

      updatePOItemByPOId(POId, newData)

    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const perpaxColumns = [
    {
      key: 'No',
      title: intl.formatMessage({ id: 'page.modal.column.no' }),
      dataIndex: 'No',
      width: '5%',
      editable: false,
    },
    {
      key: 'MaterialDescription',
      title: intl.formatMessage({ id: 'page.modal.column.matdesc' }),
      dataIndex: 'MaterialDescription',
      width: '10%',
      editable: true,
    },
    {
      key: 'FirstDate',
      title: intl.formatMessage({ id: 'page.modal.column.date' }),
      dataIndex: 'FirstDate',
      width: '7%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_FirstDate === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'Remark',
      title: intl.formatMessage({ id: 'page.modal.column.remark' }),
      dataIndex: 'Remark',
      width: '10%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_Remark === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'Qty',
      title: intl.formatMessage({ id: 'page.modal.column.qty' }),
      dataIndex: 'Qty',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_Qty === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'Width',
      title: intl.formatMessage({ id: 'page.modal.column.width' }),
      dataIndex: 'Width',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_Width === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'Length',
      title: intl.formatMessage({ id: 'page.modal.column.length' }),
      dataIndex: 'Length',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_Length === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'InternalDimension1',
      title: intl.formatMessage({ id: 'page.modal.column.dim1' }),
      dataIndex: 'InternalDimension1',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_InternalDimension1 === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'InternalDimension2',
      title: intl.formatMessage({ id: 'page.modal.column.dim2' }),
      dataIndex: 'InternalDimension2',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_InternalDimension2 === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'InternalDimension3',
      title: intl.formatMessage({ id: 'page.modal.column.dim3' }),
      dataIndex: 'InternalDimension3',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_InternalDimension3 === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'InternalDimension4',
      title: intl.formatMessage({ id: 'page.modal.column.dim4' }),
      dataIndex: 'InternalDimension4',
      widthwidth: '6%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_InternalDimension4 === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text === 'null' ? '-' : text}</span>
      },
    },
    {
      key: 'InternalDimension5',
      title: intl.formatMessage({ id: 'page.modal.column.dim5' }),
      dataIndex: 'InternalDimension5',
      width: '6%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_InternalDimension4 === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text === 'null' ? '-' : text}</span>
      },
    },
    {
      key: 'InternalDimension6',
      title: intl.formatMessage({ id: 'page.modal.column.dim6' }),
      dataIndex: 'InternalDimension6',
      width: '6%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_InternalDimension6 === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text === 'null' ? '-' : text}</span>
      },
    },  
    {
      key: 'Status',
      title: 'Status',
      width: '10%',
      dataIndex: 'rpa_status',
      render: stat => {
        return stat === 'S' ? (
          <Badge status="success" text="Success" /> )
            : stat === 'F' ? <Badge status="error" text="Failed" /> 
            : stat === 'R' ? <Badge status="default" text="Waiting" /> 
            : <Badge status="error" text="-" />
      }
    },
    {
      key: 'RPAMsg',
      title: 'RPA Msg.',
      width: '10%',
      dataIndex: 'rpa_message',
      onCell: () => {
        return {
           style: {
              whiteSpace: 'nowrap',
              maxWidth: 100,
           }
        }
     },
     render: (text) => {
       return (
        <Tooltip title={text}>
          <div style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{text}</div>
        </Tooltip>
       )
     }
    },
    {
      key: 'operation',
      title: 'Action',
      dataIndex: 'operation',
      width: '10%',
      align: 'center',
      render: (_, record) => {
        if (props.values.po_status === 'S' || props.values.po_status === 'P' || props.values.po_status === 'M') {
          return null;
        }
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Popconfirm 
              title="Confirm Edit?" 
              onConfirm={() => save(record.item_id)}
              okButtonProps={{
                type: 'default',
              }}
              cancelButtonProps={{type: 'danger'}} 
            >
              <a
                onConfirm={() => save(record.item_id)}
                style={{
                  marginRight: 8,
                }}
              >
                Save
              </a>
            </Popconfirm>
            <a onClick={cancel}>Cancel</a>
          </span>
        ) : (
          <a disabled={editingKey !== ''} onClick={() => edit(record)}  >
            Edit
          </a>
        );
      },
    },
  ];

  const columns = [
    {
      key: 'No',
      title: intl.formatMessage({ id: 'page.modal.column.no' }),
      dataIndex: 'No',
      width: '5%',
      editable: false,
    },
    {
      key: 'MaterialDescription',
      title: intl.formatMessage({ id: 'page.modal.column.matdesc' }),
      dataIndex: 'MaterialDescription',
      width: '10%',
      editable: true,
    },
    {
      key: 'FirstDate',
      title: intl.formatMessage({ id: 'page.modal.column.date' }),
      dataIndex: 'FirstDate',
      width: '7%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_FirstDate === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'Remark',
      title: intl.formatMessage({ id: 'page.modal.column.remark' }),
      dataIndex: 'Remark',
      width: '10%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_Remark === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'Qty',
      title: intl.formatMessage({ id: 'page.modal.column.qty' }),
      dataIndex: 'Qty',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_Qty === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'Width',
      title: intl.formatMessage({ id: 'page.modal.column.width' }),
      dataIndex: 'Width',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_Width === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'Length',
      title: intl.formatMessage({ id: 'page.modal.column.length' }),
      dataIndex: 'Length',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_Length === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'InternalDimension1',
      title: intl.formatMessage({ id: 'page.modal.column.dim1' }),
      dataIndex: 'InternalDimension1',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_InternalDimension1 === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'InternalDimension2',
      title: intl.formatMessage({ id: 'page.modal.column.dim2' }),
      dataIndex: 'InternalDimension2',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_InternalDimension2 === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'InternalDimension3',
      title: intl.formatMessage({ id: 'page.modal.column.dim3' }),
      dataIndex: 'InternalDimension3',
      width: '5%',
      editable: true,
      render: (text, row, index) => {
        return <span className={row.highlight_InternalDimension3 === 'true' && (po_status === 'W' || po_status === 'D') ? 'highlight-cell' : ''}>{text}</span>
      },
    },
    {
      key: 'Status',
      title: 'Status',
      width: '10%',
      dataIndex: 'rpa_status',
      render: stat => {
        return stat === 'S' ? (
          <Badge status="success" text="Success" /> )
            : stat === 'F' ? <Badge status="error" text="Failed" /> 
            : stat === 'R' ? <Badge status="default" text="Waiting" /> 
            : <Badge status="error" text="-" />
      }
    },
    {
      key: 'RPAMsg',
      title: 'RPA Msg.',
      width: '10%',
      dataIndex: 'rpa_message',
      onCell: () => {
        return {
           style: {
              whiteSpace: 'nowrap',
              maxWidth: 100,
           }
        }
     },
     render: (text) => {
       return (
        <Tooltip title={text}>
          <div style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{text}</div>
        </Tooltip>
       )
     }
    }, 
    {
      key: 'operation',
      title: 'Action',
      dataIndex: 'operation',
      width: '10%',
      align: 'center',
      render: (_, record) => {
        if (props.values.po_status === 'S' || props.values.po_status === 'P' || props.values.po_status === 'M') {
          return null;
        }
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Popconfirm 
              title="Confirm Edit?" 
              onConfirm={() => save(record.item_id)}
              okButtonProps={{
                type: 'default',
              }}
              cancelButtonProps={{type: 'danger'}} 
            >
              <a
                onConfirm={() => save(record.item_id)}
                style={{
                  marginRight: 8,
                }}
              >
                Save
              </a>
            </Popconfirm>
            <a onClick={cancel}>Cancel</a>
          </span>
        ) : (
          <a disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </a>
        );
      },
    },
  ];

  let mergedColumns;
  if (companyId && companyId === 1) {
    mergedColumns = perpaxColumns.map(col => {
      if (!col.editable) {
        return col;
      }
  
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: 
            col.dataIndex === 'Remark' || col.dataIndex === 'FirstDate' || col.dataIndex === 'MaterialDescription' ? 'text' : 'number',
          rules:
            col.dataIndex === 'Remark' 
            ? [{
              validator: (rule, value, callback) => {
                if (value && Array.isArray(value) && value.length > 1) {
                  callback("เลือกได้แค่ 1 รายการ");
                } else {
                  callback();
                }
                return;
              }
            }] 
            : col.dataIndex === 'FirstDate' || col.dataIndex === 'MaterialDescription'
            ? [{required: true, message: `required!`}] 
            : (col.dataIndex === 'Qty' || col.dataIndex === 'Width' || col.dataIndex === 'Length') 
            ? [{ required: true, message: `number only!`}]
            : [{ required: false }],
          dataIndex: col.dataIndex === "" ? null : col.dataIndex,
          title: col.title,
          editing: isEditing(record),
        }),
      };
    });
  }
  else {
    mergedColumns = columns.map(col => {
      if (!col.editable) {
        return col;
      }
  
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: 
            col.dataIndex === 'Remark' || col.dataIndex === 'FirstDate' || col.dataIndex === 'MaterialDescription' ? 'text' : 'number',
          rules:
            col.dataIndex === 'Remark' ? 
            [{
              validator: (rule, value, callback) => {
                if (value && Array.isArray(value) && value.length > 1) {
                  callback("เลือกได้แค่ 1 รายการ");
                } else {
                  callback();
                }
                return;
              }
            }] 
            : col.dataIndex === 'FirstDate' || col.dataIndex === 'MaterialDescription'
            ? [{required: true, message: `required!`}] 
            : (col.dataIndex === 'Qty' || col.dataIndex === 'Width' || col.dataIndex === 'Length') 
            ? [{ required: true, message: `number only!`}]
            : [{ required: false }],
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
        }),
      };
    });
  }

  return (
    <Form form={form} component={false}>
      <Table
        rowKey="po_items"
        size="small"
        className={styles.container}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={false}
        locale={{ emptyText: '' }}
        // pagination={{
        //   position: ['bottomCenter'],
        //   total: data.length,
        //   defaultPageSize: 3,
        //   pageSizeOptions: ["3", "5", "10", "20"],
        //   showSizeChanger: true,
        //   showTotal: (total, range) => `${range[0]}-${range[1]} of total ${total} items`,
        //   // locale: {items_per_page: 'items / page'},
        //   onChange: cancel,
        // }}
      />
    </Form>
  );
};

// export default () => (
//   <div className={styles.container}>
//     <div id="components-table-demo-edit-row">
//       <EditableTable />
//     </div>
//   </div>
// );

export default EditableTable;
