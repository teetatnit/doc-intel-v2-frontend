import request from '@/utils/request';

export async function getStatusList() {
    return request(`${API_URL}/status`).then((res) => {
        return res;
    });
  }