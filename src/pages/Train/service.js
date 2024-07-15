/*
Creator:            Kittichai R.
Creation date:      02/Nov/2021
*/

import reqwest from 'reqwest';
import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function uploadTrainModelFile(model_template_id, file) {
  const formData = new FormData();
  formData.set('file', file);
  return reqwest({
    url: `${API_URL}/uploadtrainmodelfile/${model_template_id}`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    },
    processData: false,
    data: formData,
    error: (error) => {
      console.log('Upload error : ', error);
    },
  });
}

export async function getDocument() {
  return request(`${API_URL}/documents`).then((res) => {
    return res;
  });
}

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

export async function getModelByModelTemplateId(model_template_id) {
  return request(`${API_URL}/model/modeltemplateid/${model_template_id}`).then((res) => {
    return res;
  });
}

export async function getMasterdatasByModelTemplateId(model_template_id) {
  return request(`${API_URL}/masterdatas/modeltemplateid/${model_template_id}`).then((res) => {
    return res;
  });
}

export async function updateModelSetIsDefault(model_id, model_template_id) {
  return request(`${API_URL}/model/${model_id}/isdefault`, {
    method: 'POST',
    data: {
      model_template_id: model_template_id,
    },
  });
}


export async function getModelTemplate() {
  return request(`${API_URL}/modeltemplate`, { params: { email: userProfile.ssoAccount, } }).then((res) => {
    return res;
  });
}

export async function getTrainModelByModelId(model_id) {
  return request(`${API_URL}/modeltemplate/${model_id}`).then((res) => {
    return res;
  });
}

export async function createModelTemplate(
  document_code,
  vendor_code,
  masterdataId,
  displayName,
  description,
) {
  return request(`${API_URL}/modeltemplate`, {
    method: 'POST',
    data: {
      document_code: document_code,
      vendor_code: vendor_code,
      masterdata_id: masterdataId,
      display_name: displayName,
      description: description,
    },
  });
}

export async function getTrainModelFile() {
  return request(`${API_URL}/trainmodelfile`).then((res) => {
    return res;
  });
}

export async function deleteTrainModelFileByModelFileId(model_file_id) {
  return request(`${API_URL}/trainmodelfile`, {
    method: 'DELETE',
    data: {
      model_file_id: model_file_id
    }
  }).then((res) => {
    return res;
  });
}

export async function getTrainModelFileByModelId(model_id) {
  return request(`${API_URL}/trainmodelfile/${model_id}`).then((res) => {
    return res;
  });
}


export async function createTrainModelFile(
  file,
  originalName,
  fileSize,
  filePath,
  fullPath,
  modelTemplateId,
) {
  return request(`${API_URL}/trainmodelfile`, {
    method: 'POST',
    data: {
      file: file,
      file_name: fullPath.substr(fullPath.lastIndexOf('/') + 1),
      original_name: originalName,
      file_size: fileSize,
      file_path: filePath,
      full_path: fullPath.replace(/\//g, '\\\\'),
      model_template_id: modelTemplateId,
    },
  });
}

export async function uploadFileToAzureByModelTemplateId(model_template_id) {
  return request(`${API_URL}/trainmodelfile/azureupload/modeltemplateid/${model_template_id}`).then(
    (res) => {
      return res;
    },
  );
}

export async function getTrainModalCfgConnection(model_template_id) {
  return request(`${API_URL}/trainmodelcfg/connection/${model_template_id}`).then((res) => {
    return res;
  });
}

export async function getTrainModalCfgProject(model_template_id) {
  return request(`${API_URL}/trainmodelcfg/project/${model_template_id}`).then((res) => {
    return res;
  });
}
