/*
Creator:            Apiwat Emem
Creation date:      27/05/2021
*/

import request from '@/utils/request';

export async function getPaidForsList() {
    return request(`${API_URL}/paidfors`).then((res) => {
        return res;
    });
}
