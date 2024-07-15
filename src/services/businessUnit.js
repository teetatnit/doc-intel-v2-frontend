import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function getBusinessUnitRawList() {
  return request(`${API_URL}/businessunit/raw`).then((res) => {
    return res;
  });
}

export async function getBusinessUnitList() {
  return request(`${API_URL}/businessunit`).then((res) => {
    return res;
  });
}

export async function updateBusinessUnit(business_unit_code, business_unit_name) {
  return request(`${API_URL}/businessunit/${business_unit_code}/update`, {
    method: 'POST',
    data: {
      business_unit_name: business_unit_name,
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function createBusinessUnit(data) {
  return request(`${API_URL}/businessunit`, {
    method: 'POST',
    data: {
      business_unit_code: data.code,
      business_unit_name: data.name,
      create_by: userProfile.ssoAccount,
    },
  });
}

export async function deleteBusinessUnit(business_unit_code) {
  return request(`${API_URL}/businessunit/${business_unit_code}/delete`, {
    method: 'POST',
    data: {
      is_active: 'N',
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function activeBusinessUnit(business_unit_code) {
  return request(`${API_URL}/businessunit/${business_unit_code}/delete`, {
    method: 'POST',
    data: {
      is_active: 'Y',
      update_by: userProfile.ssoAccount,
    },
  });
}
