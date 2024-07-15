import request from '@/utils/request';

export async function getMasterFieldsList() {
    return request(`${API_URL}/masterfields`).then((res) => {
        return res;
    });
  }
