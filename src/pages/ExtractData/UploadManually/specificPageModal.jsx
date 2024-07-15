/*
Creator:            Chanakan C.
Creation date:      7/Jul/2021
*/

import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Input, Modal, Row, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { FormattedMessage, formatMessage } from 'umi';
import { Document, Page } from 'react-pdf'
import styles from './index.less';

const specificPageModal = props => {
  const [form] = Form.useForm();

  const [invalidPages, setInvalidPages] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [specificPageModalVisible, setSpecificPageModalVisible] = useState(props.values.specificPageModalVisible);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window
    return { width, height }
  }

  const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

    useEffect(() => {
      const handleResize = () => setWindowDimensions(getWindowDimensions())
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
  }
  const { width } = useWindowDimensions();

  const handleOk = () => {
    var fields = form.getFieldsValue();
    if (fields['pages'] !== undefined) {
      var tempPageSet = fields['pages'].replace(/ /g, '');
      tempPageSet = tempPageSet.split(",");

      var invalidPages = false;
      var pageSet = [];
      tempPageSet.forEach(e => {
        var matchingStr = e.match(/(,*(?:\s*\d{1,}\s*-\s*\d{1,}\s*))/g);
        if (matchingStr !== null) {
          if (matchingStr.length > 1) {
            invalidPages = true;
          } if (matchingStr.length === 1 && e === matchingStr[0]) {
            var pageRange = matchingStr[0].split("-");
            var pageRange0 = parseInt(pageRange[0]);
            var pageRange1 = parseInt(pageRange[1]);
            if (pageRange0 > pageRange1 || pageRange0 > numPages || pageRange1 > numPages) {
              invalidPages = true;
            } else {
              pageSet = [...pageSet, ...range(pageRange0, pageRange1)];
            }
          } else if (e !== matchingStr[0]) {
            invalidPages = true;
          }
        } else {
          var matchingStr = e.match(/(,*(?:\s*\d{1,}\s*))/g);
          if (matchingStr !== null) {
            if (e === matchingStr[0]) {
              pageSet = [...pageSet, parseInt(e)];
            } else {
              invalidPages = true;
            }
          } else {
            invalidPages = true;
          }
        }
      });
      
      if (!invalidPages) {
        setInvalidPages(false);
        setSpecificPageModalVisible(false);
        props.setSpecificPageModalVisible(false)
        props.setFileAndPageList([...props.values.fileList, props.values.specificPageFile], [...props.values.specificPageList, pageSet]);
      } else {
        setInvalidPages(true);
      }
    }
  };

  const handleCancel = () => {
    setSpecificPageModalVisible(false);
    props.setSpecificPageModalVisible(false)
  };

  const renderFooter = () => {
    return (
      <>
        <div style={{ display: "flex" }}>
          <Button
            onClick={handleOk}
            shape="round"
            style={{
              marginLeft: "auto",
            }}
            type="primary"
          >
            OK
          </Button>
        </div>
      </>
    );
  };

  function range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx)
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function changeZoomLevel(offset) {
    setZoomLevel(prevZoomLevel => prevZoomLevel + offset);
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

  useEffect(() => {
    
  }, [])

  return (
    <Modal
      footer={renderFooter()}
      onCancel={handleCancel}
      style={{
        top: 10,
        width: (width * 0.8),
        minWidth: (width * 0.8)
      }}
      title={<FormattedMessage id="component.specificPageModal.title" />}
      visible={specificPageModalVisible}
    >
      <Row>
        <Col span={16} style={{ maxHeight: "400px", overflowY: "auto", marginBottom: '10px' }}>
          <div  >
            <Document
              file={props.values.specificPageFile}
              renderMode='canvas'
              onLoadSuccess={onDocumentLoadSuccess}
              size='A4'
            >
              <Page
                pageNumber={pageNumber}
                scale={zoomLevel}
              />
            </Document>
          </div>
        </Col>
        <Col span={8}>
          <Form
            form={form}
            name="basic"
            labelCol={{
              span: 24,
            }}
            wrapperCol={{
              span: 24,
            }}
            initialValues={{
              remember: true,
            }}
          >
            <Form.Item
              help={invalidPages ? <FormattedMessage id="component.specificPage.help" /> : null}
              label={<FormattedMessage id="component.specificPage.label" />}
              name="pages"
              rules={[
                {
                  required: true,
                  message: <FormattedMessage id="component.specificPage.placeholder" />,
                },
              ]}
              style={{
                marginLeft: 16,
              }}
              validateStatus={invalidPages ? "error" : null}
            >
              <Input
                allowClear
                onChange={() => {
                  setInvalidPages(false);
                }}
                placeholder={formatMessage({ id: 'component.specificPage.placeholder' })}
              >
              </Input>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col span={16}>
          <div style={{ textAlign: 'center' }}>
            <div className={styles.pdfController}>
              <Tooltip title="Zoom In" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
                <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
              </Tooltip>
              <Tooltip title="Zoom Out" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
                <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
              </Tooltip>
              <Tooltip title="Previous Page" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
                <Button icon={<LeftOutlined />} onClick={previousPage} disabled={pageNumber === 1} />
              </Tooltip>
              <span className={styles.pageNo}>Page {pageNumber} of {numPages}</span>
              <Tooltip title="Next Page" placement="bottom" mouseEnterDelay={0.01} mouseLeaveDelay={0.01}>
                <Button icon={<RightOutlined />} onClick={nextPage} disabled={pageNumber === numPages} />
              </Tooltip>
            </div>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default specificPageModal;