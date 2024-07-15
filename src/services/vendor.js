import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function getVendorsList() {
  return request(`${API_URL}/vendors`).then((res) => {
      return res;
  });
}

export async function getVendorsRawList() {
  return request(`${API_URL}/vendors/raw`).then((res) => {
      return res;
  });
}

export async function updateVendors(code, name) {
  return request(`${API_URL}/vendors/${code}/update`, {
      method: 'POST',
      data: {
          "name": name,
          "update_by": userProfile.ssoAccount
      },
  });
}

export async function createVendors(data) {
  return request(`${API_URL}/vendors`, {
      method: 'POST',
      data: {
          "code": data.code,
          "name": data.name,
          "create_by": userProfile.ssoAccount
      },
  });
}

export async function deleteVendors(code) {
  return request(`${API_URL}/vendors/${code}/delete`, {
      method: 'POST',
      data: {
          "is_active": 'N',
          "update_by": userProfile.ssoAccount
      },
  });
}

export async function activeVendors(code) {
  return request(`${API_URL}/vendors/${code}/delete`, {
      method: 'POST',
      data: {
          "is_active": 'Y',
          "update_by": userProfile.ssoAccount
      },
  });
}