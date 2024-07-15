import request from '@/utils/request';
import { Route } from 'umi';

export async function queryRule(params) {
  // request('/api/rule', {
  //   params,
  // });
  return request
  .get('/api/rule')
  .then( (response) => {
    return response;
  })
  .catch( (error) => {
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
    headers: { 'Authorization' : `Bearer ${sessionStorage.getItem('token')}` }, 
    params: { 
      sort: params.sorter,
      status: params.po_status,
    } 
  }).then((res) => {
      return { "data": res, "success" : true };
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
    headers: { 'Authorization' : `Bearer ${sessionStorage.getItem('token')}` }, 
    params: { sort: 'desc' } 
  }).then((res) => {
      return { "data": res, "success" : true };
    });
  
}

export async function getPODetailsByPOId(POId) {
  return request(`${API_URL}/po/${POId}/items?h=true`, {})
    .then((res) => {
      return { "data": res[0], "success" : true };
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
    data: { "items" : data, "po_status": "D" },
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

export async function createFile(originalName, filePath, fullPath, companyId) {
  return request(`${API_URL}/files`, {
    method: 'POST',
    data: [{ 
      "file_name" : fullPath.substr(fullPath.lastIndexOf("/") + 1),
      "original_name" : originalName,
      "file_path" : filePath,
      "full_path" : fullPath.replace(/\//g, '\\\\'),
      "company_id": companyId
    }],
  });
}

export async function getCompany() {
  return request(`${API_URL}/company`).then((res) => {
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
      "full_path" : fullPath.replace(/\//g, '\\\\'),
      "code": masterType
    },
  });
}