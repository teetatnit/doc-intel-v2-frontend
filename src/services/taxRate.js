import request from '@/utils/request';

export async function getTaxRatesList() {
    return request(`${API_URL}/taxrates`).then((res) => {
        return res;
    });
  }