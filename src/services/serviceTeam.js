import request from '@/utils/request';

export async function getServiceTeamsList() {
    return request(`${API_URL}/serviceteams`).then((res) => {
        return res;
    });
  }