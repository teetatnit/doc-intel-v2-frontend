/*
Creator:            Apiwat Emem
Creation date:      27/05/2021
*/

import request from '@/utils/request';

export async function getBankChargesList() {
    return request(`${API_URL}/bankcharges`).then((res) => {
        return res;
    });
}
