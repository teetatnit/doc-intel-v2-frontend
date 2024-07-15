/*
Creator:            Apiwat Emem
Creation date:      27/05/2021
*/

import request from '@/utils/request';

export async function getPreAdvicesList() {
    return request(`${API_URL}/preadvices`).then((res) => {
        return res;
    });
}
