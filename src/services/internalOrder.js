/*
Creator:            Apiwat Emem
Creation date:      18/05/2021
*/

import request from '@/utils/request';

export async function getInternalOrdersList() {
    return request(`${API_URL}/internalorders`).then((res) => {
        return res;
    });
}
