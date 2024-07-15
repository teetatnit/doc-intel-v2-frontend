import request from '@/utils/request';

export async function getCurrenciesList() {
    return request(`${API_URL}/currencies`).then((res) => {
        return res;
    });
  }