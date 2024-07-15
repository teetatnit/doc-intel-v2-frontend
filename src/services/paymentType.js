import request from '@/utils/request';

export async function getPaymentTypesList() {
    return request(`${API_URL}/paymenttypes`).then((res) => {
        return res;
    });
}

export async function getPaymentTypesListByCompanyCode(company_code) {
    return request(`${API_URL}/paymenttypes`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
        params: {
            company_code: company_code,
        }
    }).then((res) => {
        return res;
    });
}