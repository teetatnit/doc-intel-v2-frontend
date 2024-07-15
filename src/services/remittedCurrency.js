/*
Creator:            Apiwat Emem
Creation date:      27/05/2021
*/

import request from '@/utils/request';

export async function getRemittedCurrenciesList() {
    return request(`${API_URL}/remittedcurrencies`).then((res) => {
        return res;
    });
}
