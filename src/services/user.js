import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}
export async function queryCurrent() {
  return request('/api/currentUser');
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function getUsersList() {
  return request(`${API_URL}/users`).then((res) => {
    return res;
  });
}

export async function updateUserRole(user_id, role, update_by) {
  return request(`${API_URL}/users/${user_id}/role`, {
    method: 'POST',
    data: {
      role: role,
      update_by: update_by,
    },
  });
}

export async function createUser(data, name, create_by) {
  return request(`${API_URL}/users`, {
    method: 'POST',
    data: {
      email: data.email,
      company_code: data.company_code,
      division_code: data.division_code,
      role: data.role,
      create_by: create_by,
      name: name,
    },
  });
}

export async function createUserWithEmail(data, create_by) {
  return request(`${API_URL}/users`, {
    method: 'POST',
    data: {
      email: data.email,
      company_code: '0000',
      division_code: '0000',
      role: data.role,
      create_by: create_by,
      name: data.name,
    },
  });
}

export async function deleteUser(user_id, update_by) {
  return request(`${API_URL}/users/${user_id}/delete`, {
    method: 'POST',
    data: {
      is_active: 'N',
      update_by: update_by,
    },
  });
}
