/*
Creator:            Chanakan C.
Creation date:      10/Jun/2021
*/

import request from '@/utils/request';

export async function getDocumentTypeList() {
    return request(`${API_URL}/documenttypes`).then((res) => {
        return res;
    });
  }