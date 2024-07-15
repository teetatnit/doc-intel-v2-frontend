import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function getSuppliersList() {
  return request(`${API_URL}/suppliers`).then((res) => {
      return res;
  });
}

export async function updateSupplier(supplier_code, supplier_name, supplier_email) {
  return request(`${API_URL}/suppliers/${supplier_code}/update`, {
    method: 'POST',
    data: { 
      "supplier_name" : supplier_name,
      "supplier_email" : supplier_email,
      "update_by" : userProfile.ssoAccount
    },
  });
}

export async function createSupplier(data) {
  return request(`${API_URL}/suppliers`, {
    method: 'POST',
    data: { 
      "supplier_code" : data.supplier_code,
      "supplier_name" : data.supplier_name,
      "supplier_email": data.supplier_email,
      "create_by" : userProfile.ssoAccount
    },
  });
}

export async function deleteSupplier(supplier_code) {
  return request(`${API_URL}/suppliers/${supplier_code}/delete`, {
    method: 'POST',
    data:{
      "is_active" : 'N',
      "update_by" : userProfile.ssoAccount
    },
  });
}