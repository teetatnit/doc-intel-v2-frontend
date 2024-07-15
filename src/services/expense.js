import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function getExpensesList() {
  return request(`${API_URL}/expenses`).then((res) => {
    return res;
  });
}

export async function getExpensesRawList() {
  return request(`${API_URL}/expenses/raw`).then((res) => {
    return res;
  });
}

export async function updateExpenses(code, name) {
  return request(`${API_URL}/expenses/${code}/update`, {
    method: 'POST',
    data: {
      name: name,
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function createExpenses(data) {
  return request(`${API_URL}/expenses`, {
    method: 'POST',
    data: {
      code: data.code,
      name: data.name,
      create_by: userProfile.ssoAccount,
    },
  });
}

export async function deleteExpenses(code) {
  return request(`${API_URL}/expenses/${code}/delete`, {
    method: 'POST',
    data: {
      is_active: 'N',
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function activeExpenses(code) {
  return request(`${API_URL}/expenses/${code}/delete`, {
    method: 'POST',
    data: {
      is_active: 'Y',
      update_by: userProfile.ssoAccount,
    },
  });
}
