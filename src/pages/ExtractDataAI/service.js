/*
Revisor:            Chanakan C.
Revision date:      27/Apr/2021
Revision Reason:    Add and modify some APIs

Revisor:            Apiwat Emem
Revision date:      7/May/2021
Revision Reason:    Modify some APIs

Revisor:            Supawit N.
Revision date:      07/Jun/2024
Revision Reason:    Add Get AI-Model
*/

import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());
export async function queryRule(params) {
  request('/api/rule', {
    params,
  });
  return request
    .get('/api/rule')
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
}
export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    data: { ...params, method: 'delete' },
  });
}
export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updateRule(params) {
  return request(`${API_URL}/po/${params.po_id}/items`, {
    method: 'POST',
    data: { "po_status": "R" },
  });
}

export async function getPOList(params) {
  let route = '';
  if (params && params.startDate && params.endDate) {
    route = `po/btw/${params.startDate}/and/${params.endDate}`;
  }
  else if (params && params.po_status) {
    route = `po/${params.po_status}/status`;
  }
  else {
    route = 'po';
  }
  return request(`${API_URL}/${route}`, {
    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
    params: {
      sort: params.sorter,
      status: params.po_status,
    }
  }).then((res) => {
    return { "data": res, "success": true };
  });
}

export async function getFileList(params) {
  let route = '';
  if (params && params.startDate && params.endDate) {
    route = `files/btw/${params.startDate}/and/${params.endDate}`;
  }
  else if (params && params.status) {
    route = `files/${params.status}/status`;
  } else {
    route = 'files';
  }
  return request(`${API_URL}/${route}`, {
    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
    params: { sort: 'desc' }
  }).then((res) => {
    return { "data": res, "success": true };
  });

}

export async function getPODetailsByPOId(POId) {
  return request(`${API_URL}/po/${POId}/items?h=true`, {})
    .then((res) => {
      return { "data": res[0], "success": true };
    });
}

export async function getFileById(fileId) {
  return request(`${API_URL}/file/${fileId}/content`, {
    responseType: 'arrayBuffer'
  });
}

export async function updatePOItemByPOId(POId, data) {
  return request(`${API_URL}/po/${POId}/items`, {
    method: 'POST',
    data: { "items": data, "po_status": "D" },
  });
}

export async function updatePONumber(POId, data) {
  return request(`${API_URL}/po/${POId}/po_number`, {
    method: 'POST',
    data,
  });
}

export async function updatePOStatusM(POId) {
  return request(`${API_URL}/po/${POId}/status`, {
    method: 'POST',
    data: { "po_status": "M" },
  });
}

export async function deletePOByPOId(POId) {
  return request(`${API_URL}/po/${POId}/hide`, {
    method: 'POST',
  });
}

// ***** 07/May/2021 Apiwat Emem Modify Start ***** //
export async function createFile(file, originalName, fileSize, filePath, fullPath, document_code, vendor_code, masterdata_id, specificPage) {
  return request(`${API_URL}/ocrfiles`, {
    method: 'POST',
    data: [{
      // ***** 7/May/2021 Apiwat Emem Add Start ***** //
      "file": file,
      // ***** 7/May/2021 Apiwat Emem Add End ***** //
      "file_name": fullPath.substr(fullPath.lastIndexOf("/") + 1),
      "original_name": originalName,
      "file_size": fileSize,
      "file_path": filePath,
      "full_path": fullPath.replace(/\//g, '\\\\'),
      "document_code": document_code,
      "vendor_code": vendor_code,
      "masterdata_id": masterdata_id,
      "specific_page": specificPage,
    }],
  });
}
// ***** 07/May/2021 Apiwat Emem Modify End ***** //

export async function getCompany() {
  return request(`${API_URL}/companies`).then((res) => {
    return res;
  });
}

export async function getOCRMaster() {
  return request(`${API_URL}/master/config`).then((res) => {
    return res;
  });
}

export async function updateOCRMaster(fullPath, masterType) {
  return request(`${API_URL}/master`, {
    method: 'POST',
    data: {
      "full_path": fullPath.replace(/\//g, '\\\\'),
      "code": masterType
    },
  });
}

// ***** 27/Apr/2021 Chanakan C. Mod Start ***** //
export async function getOCRFileList(params) {
  delete params['uploadedDate'];

  return request(`${API_URL}/ocrfiles`, {
    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
    params: { ...params, sort: 'desc' }
  });
}
// ***** 27/Apr/2021 Chanakan C. Mod End ***** //

export async function getOCRFileContentByFileId(file_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/content`, {
    responseType: 'arrayBuffer'
  });
}

export async function deleteOCRFileByFileId(file_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/delete`, {
    method: 'POST',
    data: {
      "is_delete": 'Y',
      "update_by": userProfile.ssoAccount
    },
  });
}

// ***** 27/Apr/2021 Chanakan C. Add Start ***** //
export async function deleteMultipleOCRFilesByFileId(selectedRowKeys) {
  let file_id = 1
  return request(`${API_URL}/ocrfiles/${file_id}/multipledelete`, {
    method: 'POST',
    data: {
      "selectedRowKeys": selectedRowKeys
    },
  });
}
// ***** 27/Apr/2021 Chanakan C. Add End ***** //

// ***** 27/Apr/2021 Chanakan C. Mod Start ***** //
export async function getOCRFileById(file_id) {
  return request(`${API_URL}/ocrfiles/${file_id}`, {})
    .then((res) => {
      return { "data": res[0], "success": true };
    });
}

export async function updateFieldsByFileId(file_id, fields) {
  return request(`${API_URL}/ocrfiles/${file_id}/updatefields`, {
    method: 'POST',
    data: fields,
  });
}

export async function updateOCRFileStatus(file_id, ocr_status) {
  return request(`${API_URL}/ocrfiles/${file_id}/status`, {
    method: 'POST',
    data: {
      "ocr_status": ocr_status,
      "update_by": userProfile.ssoAccount
    },
  });
}
// ***** 27/Apr/2021 Chanakan C. Mod End ***** //

export async function getDocument() {
  return request(`${API_URL}/documents`).then((res) => {
    return res;
  });
}

// ***** 27/Apr/2021 Chanakan C. Add Start ***** //
export async function getMasterDataItem(masterdata_id) {
  return request(`${API_URL}/masterdatas/${masterdata_id}/items`).then((res) => {
    return { "data": res, "success": true };
  });
}
// ***** 27/Apr/2021 Chanakan C. Add End ***** //

// ***** 07/May/2021 Apiwat Emem Mod Start ***** //
export async function getVendorByDocumentCode(document_code) {
  return request(`${API_URL}/masterdatas/${document_code}/vendor`).then((res) => {
    return res;
  });
}

export async function getAdditionalInfoByDocumentCodeVendorCode(document_code, vendor_code) {
  return request(`${API_URL}/masterdatas/${document_code}/${vendor_code}/additional_info`).then((res) => {
    return res;
  });
}
// ***** 07/May/2021 Apiwat Emem Mod End ***** //

// ***** 27/Apr/2021 Chanakan C. Add Start ***** //
export async function getMasterFileStatus() {
  return request(`${API_URL}/MST_FileStatus`).then((res) => {
    return res;
  });
}
// ***** 27/Apr/2021 Chanakan C. Add End ***** //

// ***** 13/05/2021 Apiwat Emem Add Start ***** //
export async function getOCRResultByFileId(file_id) {
  return request(`${API_URL}/ocrfiles/ocrresult/${file_id}`, {})
    .then((res) => {
      return res;
    });
}
// ***** 13/05/2021 Apiwat Emem Add End ***** //

// ***** 19/05/2021 Apiwat Emem Add Start ***** //
export async function createAttachFile(originalName, fileSize, filePath, fullPath, file_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/attachfile`, {
    method: 'POST',
    data: {
      "file_name": fullPath.substr(fullPath.lastIndexOf("/") + 1),
      "original_name": originalName,
      "file_size": fileSize,
      "file_path": filePath,
      "full_path": fullPath.replace(/\//g, '\\\\'),
      "file_id": file_id,
      "create_by": userProfile.ssoAccount
    },
  });
}

export async function createReceiptFile(originalName, fileSize, filePath, fullPath, file_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/receiptfile`, {
    method: 'POST',
    data: {
      "file_name": fullPath.substr(fullPath.lastIndexOf("/") + 1),
      "original_name": originalName,
      "file_size": fileSize,
      "file_path": filePath,
      "full_path": fullPath.replace(/\//g, '\\\\'),
      "file_id": file_id,
      "create_by": userProfile.ssoAccount
    },
  });
}

export async function createSupportingDocFile(originalName, fileSize, filePath, fullPath, file_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/supportingdocfile`, {
    method: 'POST',
    data: {
      "file_name": fullPath.substr(fullPath.lastIndexOf("/") + 1),
      "original_name": originalName,
      "file_size": fileSize,
      "file_path": filePath,
      "full_path": fullPath.replace(/\//g, '\\\\'),
      "file_id": file_id,
      "create_by": userProfile.ssoAccount
    },
  });
}

export async function getAttachFileByFileId(file_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/attachfile`).then((res) => {
    return res;
  });
}

export async function getReceiptFileByFileId(file_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/receiptfile`).then((res) => {
    return res;
  });
}

export async function getSupportingDocFileByFileId(file_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/supportingdocfile`).then((res) => {
    return res;
  });
}

// ***** 19/05/2021 Apiwat Emem Add End ***** //

// ***** 20/05/2021 Apiwat Emem Add Start ***** //
export async function getOCRFileExportExcelByFileId(file_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/export`).then((res) => {
    return res;
  });
}
// ***** 20/05/2021 Apiwat Emem Add End ***** //

// ***** 24/05/2021 Apiwat Emem Add Start ***** //
export async function updateAttachFile(file_id, attachfile_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/attachfile/update`, {
    method: 'POST',
    data: {
      "file_id": file_id,
      "attachfile_id": attachfile_id,
      "is_delete": 'Y',
      "update_by": userProfile.ssoAccount
    },
  });
}

export async function updateReceiptFile(file_id, attachfile_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/receiptfile/update`, {
    method: 'POST',
    data: {
      "file_id": file_id,
      "attachfile_id": attachfile_id,
      "is_delete": 'Y',
      "update_by": userProfile.ssoAccount
    },
  });
}

export async function updateSupportingDocFile(file_id, attachfile_id) {
  return request(`${API_URL}/ocrfiles/${file_id}/supportingdocfile/update`, {
    method: 'POST',
    data: {
      "file_id": file_id,
      "attachfile_id": attachfile_id,
      "is_delete": 'Y',
      "update_by": userProfile.ssoAccount
    },
  });
}


// ***** 24/05/2021 Apiwat Emem Add End ***** //

// ***** 24/06/2021 Apiwat Emem Add Start ***** //
export async function sendToAllpay(file_id, fields) {
  var fileIdList = [];
  var fieldsList = [];
  fileIdList.push(file_id);
  fieldsList.push(fields);
  return request(`${API_URL}/ocrfiles/${file_id}/sendtoallpay`, {
    method: 'POST',
    data: {
      "fileIdList": fileIdList,
      "fieldsList": fieldsList,
      "allpay_by": userProfile.ssoAccount
    },
  });
}

export async function sendToAllpayMultiple(selectedRowKeys, fieldsList) {
  let file_id = 0
  return request(`${API_URL}/ocrfiles/${file_id}/sendtoallpay`, {
    method: 'POST',
    data: {
      "fileIdList": selectedRowKeys,
      "fieldsList": fieldsList,
      "allpay_by": userProfile.ssoAccount
    },
  });
}
// ***** 24/06/2021 Apiwat Emem Add End ***** //

// ***** 13/Jun/2023 Supawit N. Add Start ***** //
export async function extractOCRFilesByAI(file_id, docIntel_model, ai_model, ai_prompt) {
  return request(`${API_URL}/extractOCRFilesByAI`, {
    method: 'POST',
    data: { 
      file_id: file_id,
      docIntel_model: docIntel_model,
      ai_model: ai_model,
      ai_prompt: ai_prompt
    },
  }).then((res) => {
    return res;
  });
}
// ***** 13/Jun/2023 Supawit N. Add End ***** //

// ***** 27/Apr/2021 Chanakan C. Add Start ***** //
export async function extractOCRFiles() {
  return request(`${API_URL}/extractOCRFiles`).then((res) => {
    return res;
  });
}
// ***** 27/Apr/2021 Chanakan C. Add End ***** //

export async function getTotalPageExtracted(params) {
  delete params['uploadedDate'];

  return request(`${API_URL}/ocrfiles/totalpageextracted`, {
    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
    params: params
  }).then((res) => {
    return { "data": res, "success": true };
  });
}

  // ***** 07/Jun/2024 Supawit N. Add Start ***** //
export async function getAIModel() {
  const aiModelList = [
    {
      ai_model_name : 'Azure AI - gpt-4o (2024-04-01)',
      ai_model_code : 'azure_ai,gpt-4o,2024-04-01-preview',
    },
    {
      ai_model_name : 'Azure AI - gpt-4 (2023-03-15)',
      ai_model_code : 'azure_ai,gpt-4,2023-03-15-preview',
    }
  ]
  return aiModelList;
}

export async function getDocIntelModel() {
  const aiModelList = [
    {
      model_name : 'Document Intelligence - layout',
      model_code : 'prebuilt-layout',
    },
    {
      model_name : 'Document Intelligence - invoice',
      model_code : 'prebuilt-invoice',
    }
  ]
  return aiModelList;
}
  // ***** 07/Jun/2024 Supawit N. Add End ***** //
