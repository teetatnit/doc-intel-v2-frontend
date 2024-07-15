import request from '@/utils/request';

export async function getWhtRatesList() {
    return request(`${API_URL}/whtrates`).then((res) => {
        return res;
    });
  }