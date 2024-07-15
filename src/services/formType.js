import request from '@/utils/request';

export async function getFormTypesList() {
    return request(`${API_URL}/formtypes`).then((res) => {
        return res;
    });
  }