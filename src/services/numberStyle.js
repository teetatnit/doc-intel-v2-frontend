/*
Creator:            Apiwat Emem
Creation date:      06/05/2021
*/

import request from '@/utils/request';

export async function getNumberStyleList() {
  return request(`${API_URL}/numberstyle`).then((res) => {
    return res;
  });
}
