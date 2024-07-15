import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function getCostCentersList() {
  return request(`${API_URL}/costcenters`).then((res) => {
    return res;
  });
}

export async function getCostCentersRawList() {
  return request(`${API_URL}/costcenters/raw`).then((res) => {
    return res;
  });
}

export async function updateCostCenters(code, name) {
  return request(`${API_URL}/costcenters/${code}/update`, {
    method: 'POST',
    data: {
      name: name,
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function createCostCenters(data) {
  return request(`${API_URL}/costcenters`, {
    method: 'POST',
    data: {
      code: data.code,
      name: data.name,
      create_by: userProfile.ssoAccount,
    },
  });
}

export async function deleteCostCenters(code) {
  return request(`${API_URL}/costcenters/${code}/delete`, {
    method: 'POST',
    data: {
      is_active: 'N',
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function activeCostCenters(code) {
  return request(`${API_URL}/costcenters/${code}/delete`, {
    method: 'POST',
    data: {
      is_active: 'Y',
      update_by: userProfile.ssoAccount,
    },
  });
}
