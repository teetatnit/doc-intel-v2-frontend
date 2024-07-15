import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function getCompaniesOptionList() {
  return request(`${API_URL}/companies`).then((res) => {
    const companies = res.map((item) => {
      return {
        company_code: item.company_code,
        company_name: `${item.company_code} ${item.company_name}`,
      };
    });
    return companies;
  });
}

export async function getCompaniesRawList() {
  return request(`${API_URL}/companies/raw`).then((res) => {
    return res;
  });
}

export async function getCompaniesList() {
  return request(`${API_URL}/companies`).then((res) => {
    return res;
  });
}

export async function updateCompanies(company_code, company_name, business_unit_code) {
  return request(`${API_URL}/companies/${company_code}/update`, {
    method: 'POST',
    data: {
      company_name: company_name,
      business_unit_code: business_unit_code,
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function createCompanies(data) {
  return request(`${API_URL}/companies`, {
    method: 'POST',
    data: {
      company_code: data.code,
      company_name: data.name,
      business_unit_code: data.business_unit_code,
      create_by: userProfile.ssoAccount,
    },
  });
}

export async function deleteCompanies(company_code) {
  return request(`${API_URL}/companies/${company_code}/delete`, {
    method: 'POST',
    data: {
      is_active: 'N',
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function activeCompanies(company_code) {
  return request(`${API_URL}/companies/${company_code}/delete`, {
    method: 'POST',
    data: {
      is_active: 'Y',
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function getBusinessUnitList() {
  return request(`${API_URL}/businessunit`).then((res) => {
    return res;
  });
}
