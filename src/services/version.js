import request from '@/utils/request';

export async function getVersion() {
  return request(`${API_URL}/version`).then((res) => {
      return res;
  });
}