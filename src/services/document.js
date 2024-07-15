import request from '@/utils/request';

export async function getDocumentsList() {
    return request(`${API_URL}/documents`).then((res) => {
        return res;
    });
  }
