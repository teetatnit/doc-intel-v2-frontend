/*
Creator:            Apiwat Emem
Creation date:      21/06/2021
*/

import request from '@/utils/request';

export async function getPaymentLocationsList() {
    return request(`${API_URL}/paymentlocations`).then((res) => {
        return res;
    });
}

export async function getPaymentLocationsListByPaymentTypeCode(paymenttype_code) {
    return request(`${API_URL}/paymentlocations`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
        params: {
            paymenttype_code: paymenttype_code,
        }
    }).then((res) => {
        return res;
    });
}

export async function getPaymentLocationsListByPaymentTypeCodeCompanyCode(paymenttype_code, company_code) {
    return request(`${API_URL}/paymentlocations`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
        params: {
            paymenttype_code: paymenttype_code,
            company_code: company_code,
        }
    }).then((res) => {
        return res;
    });
}
