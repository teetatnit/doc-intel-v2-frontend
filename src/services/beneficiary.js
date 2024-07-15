import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function getBeneficiariesListByVendorCode(vendor_code, company_code) {
    return request(`${API_URL}/beneficiaries`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
        params: {
            vendor_code: vendor_code,
            company_code: company_code,
        }
    }).then((res) => {
        return res;
    });
}

export async function getBeneficiariesOptionList() {
    return request(`${API_URL}/beneficiaries`).then((res) => {
        const beneficiaries = res.map(item => {
            return { company_code: item.company_code, company_name: `${item.company_code} ${item.company_name}` }
        })
        return beneficiaries;
    });
}

export async function getBeneficiariesList() {
    return request(`${API_URL}/beneficiaries`).then((res) => {
        return res;
    });
}

export async function getBeneficiariesDownloadByCompanyCode(company_code) {
    return request(`${API_URL}/beneficiaries/download`, {
        params: {
            company_code: company_code,
        }
    }).then((res) => {
        return res;
    });
}

export async function getBeneficiariesHistoryByCompanyCode(company_code) {
    return request(`${API_URL}/beneficiaries/history`, {
        params: {
            company_code: company_code,
        }
    }).then((res) => {
        return res;
    });
}

export async function updateBeneficiariesUploadByCompanyCode(data) {
    return request(`${API_URL}/beneficiaries/upload`, {
        method: 'POST',
        data: {
            "company_code": data.company_code,
            "header_list" : data.header_list,
            "item_list": data.item_list,
            "create_by": userProfile.ssoAccount
        },
    });
}
