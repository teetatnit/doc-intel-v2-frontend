/*
Creator:            Apiwat Emem
Creation date:      13/05/2021
*/

import request from '@/utils/request';

export async function getGRApprovalForsList() {
    return request(`${API_URL}/grapprovalfors`).then((res) => {
        return res;
    });
}

export async function getGRApprovalForsListByCompanyCode(company_code) {
    return request(`${API_URL}/grapprovalfors`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
        params: {
            company_code: company_code,
        }
    }).then((res) => {
        return res;
    });
}