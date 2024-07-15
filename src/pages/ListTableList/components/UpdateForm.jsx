import React, { useState, useEffect } from 'react';
import { Form, Button, DatePicker, Input, Modal, message, Radio, Select, Steps, Table, Spin, Tooltip, Popconfirm } from 'antd';
import { FormattedMessage } from 'umi';
import { Document, Page } from 'react-pdf'
import { ZoomInOutlined, ZoomOutOutlined, RotateLeftOutlined, RotateRightOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import PoDetailTable from '../PoDetailTable';
import { getFileById, getPODetailsByPOId, updatePONumber, updatePOStatusM } from '../service';

import styles from './UpdateForm.less';

const UpdateForm = props => {
  const [formVals, setFormVals] = useState({
    key: props.values.po_id,
    po_id: props.values.po_id,
    po_no: props.values.po_number,
    items: props.values.items,
    file_id: props.values.file_id,
    page_no: parseInt(props.values.page_no, 10),
    company_id: props.values.company_id,
    po_status: props.values.po_status,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [POItemsValues, setStepFormValues] = useState({});
  const [fileData, setFileData] = useState("");
  const [form] = Form.useForm();
  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
    values,
  } = props;

  const handleNext = async () => {
    const fieldsValue = await form.validateFields();
    setFormVals({ ...formVals, ...fieldsValue });
    handleUpdate({ ...formVals, ...fieldsValue });
  };

  const handleUpdateStatusM = async () => {
    const hide = message.loading('Updating PO Status...');
    try {
      await updatePOStatusM(props.values.po_id)
      hide();
      message.success('Success');
      handleUpdateModalVisible()
      return true;
    } catch (error) {
      hide();
      message.error('Failed');
      return false;
    }
  };

  const renderFooter = () => {
    return (
      <div>
        {/* <Popconfirm 
          disabled={props.values.po_status === 'C' || props.values.po_status === 'S' || props.values.po_status === 'P' || props.values.po_status === 'M'}
          title={<FormattedMessage id="page.modal.confirmSubmit" />}
          onConfirm={() => handleNext()}
          okText={<FormattedMessage id="page.modal.confirmBtn" />}
          okButtonProps={{type: 'danger'}}
          cancelText={<FormattedMessage id="page.modal.cancelBtn" />}
          cancelButtonProps={{type: 'default'}} 
        > */}
          <Button 
            size="large" 
            type={(props.values.po_status === 'C' || props.values.po_status === 'S' || props.values.po_status === 'P' || props.values.po_status === 'M') ? 'default' : 'primary'} 
            disabled={props.values.po_status === 'C' || props.values.po_status === 'S' || props.values.po_status === 'P' || props.values.po_status === 'M'}
            onClick={() => handleNext()}
          >
            <FormattedMessage id="page.modal.submitRPA" />
          </Button>
        {/* </Popconfirm> */}
        &nbsp;
        {
          props.values.po_status === 'P' ? (
            <Button 
              size="large" 
              type="primary"
              onClick={() => handleUpdateStatusM()}
            >
              <FormattedMessage id="page.modal.flagM" />
            </Button>
          ) : null
        }
      </div>
    );
  };

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(formVals.page_no);
  const [zoomLevel, setZoomLevel] = useState(1.25);
  const [rotateDeg, setRotateDeg] = useState(formVals.company_id === 1 ? 270 : 180);

  const [editing, setEditing] = useState(false);
  const [newPONo, setnewPONo] = useState(props.values.po_number);

  const onFinish = async (data) => {
    const hide = message.loading('Updating PO Number...');
    try {
      setnewPONo(data.po_number);
      await updatePONumber(props.values.po_id, data)
      hide();
      message.success('Success');
      setEditing(false);
      return true;
    } catch (error) {
      hide();
      message.error('Failed');
      return false;
    }
  };

  const onReset = () => {
    form.resetFields();
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onSourceError(err) {
    console.log("On source error : ", err)
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function changeZoomLevel(offset) {
    setZoomLevel(prevZoomLevel => prevZoomLevel + offset);
  }

  function changeRotate(offset) {
    setRotateDeg(prevRotateDeg => prevRotateDeg + offset === -360 ? 0 : prevRotateDeg + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomOut() {
    changeZoomLevel(-0.25);
  }

  function zoomIn() {
    changeZoomLevel(0.25);
  }

  function rotateLeft() {
    changeRotate(-90);
  }

  function rotateRight() {
    changeRotate(90);
  }

  useEffect(() => {
    getFileById(formVals.file_id).then((data) => {
      setFileData(data);
    })
  }, []);

  return (
    <Modal
      className={styles.modal}
      width={1280}
      style={{ top: 10 }}
      bodyStyle={{
        padding: '10px',
      }}
      destroyOnClose
      maskClosable={false}
      title={<FormattedMessage id="page.modal.title" />}
      visible={updateModalVisible}
      footer={renderFooter()}
      onCancel={() => handleUpdateModalVisible()}
    >
      <div style={{maxHeight: "300px", overflowY: "auto", marginBottom: '10px'}}>
        <Document
          file={{data: fileData}}
          loading={<center><Spin tip="Loading File..." /></center>}
          renderMode='canvas'
          rotate={rotateDeg}
          onLoadSuccess={onDocumentLoadSuccess}
          onSourceError={onSourceError}
          // onLoadError={console.error}
        >
          <Page 
            pageNumber={pageNumber}
            scale={zoomLevel}
          />      
          {/* {Array.from(
            new Array(numPages),
            (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
              />
            ),
          )} */}
        </Document>
      </div>
      <div style={{textAlign: 'center'}}>
        <div className={styles.pdfController}>
          <Tooltip title="Zoom In" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
            <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
          </Tooltip>
          <Tooltip title="Zoom Out" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
            <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
          </Tooltip>
          {/* <Tooltip title="Previous Page" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
            <Button icon={<LeftOutlined />} onClick={previousPage} disabled={pageNumber === 1} />
          </Tooltip>
          <span className={styles.pageNo}>Page {pageNumber} of {numPages}</span>
          <Tooltip title="Next Page" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
            <Button icon={<RightOutlined />} onClick={nextPage} disabled={pageNumber === numPages} />
          </Tooltip> */}
          <Tooltip title="Rotate Left" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
            <Button icon={<RotateLeftOutlined />} onClick={rotateLeft} />
          </Tooltip>
          <Tooltip title="Rotate Right" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
            <Button icon={<RotateRightOutlined />} onClick={rotateRight} />
          </Tooltip>
        </div>
      </div>
      {editing ? (
        <div>
          <Form
            name="editPONo"
            layout="inline"
            onFinish={onFinish}
          >
            <Form.Item
              label="Enter new PO No.: "
              name="po_number"
              rules={[{ required: true, message: 'Please enter new PO No.!' }]}
            >
              <Input 
                // style={{ width: '20%' }} 
                defaultValue={newPONo} 
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Save</Button> &nbsp;
              <Button type="default" onClick={() => setEditing(false)}>Cancel</Button>
            </Form.Item>
          </Form>
        </div>
      ) 
      : (props.values.po_status === 'W' || props.values.po_status === 'D' || props.values.po_status === 'R') ? (
        <div>
          <b>PO Number: {newPONo}</b> <Button type="default" icon={<EditOutlined />} onClick={() => setEditing(true)} />
        </div>
        )
      : (
        <h3>PO Number: {newPONo}</h3>
      )
      }
      <div className="divPoDetailTable">
        <PoDetailTable values={formVals} />
      </div>
    </Modal>
  );
};

export default UpdateForm;
