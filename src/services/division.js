import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function getDivisionsList() {
    return request(`${API_URL}/divisions`).then((res) => {
        return res;
    });
}

export async function updateDivisions(division_code, division_name) {
    return request(`${API_URL}/divisions/${division_code}/update`, {
        method: 'POST',
        data: {
            "division_name": division_name,
            "update_by": userProfile.ssoAccount
        },
    });
}

export async function createDivisions(data) {
    return request(`${API_URL}/divisions`, {
        method: 'POST',
        data: {
            "division_code": data.division_code,
            "division_name": data.division_name,
            "create_by": userProfile.ssoAccount
        },
    });
}

export async function deleteDivisions(division_code) {
    return request(`${API_URL}/divisions/${division_code}/delete`, {
        method: 'POST',
        data: {
            "is_active": 'N',
            "update_by": userProfile.ssoAccount
        },
    });
}