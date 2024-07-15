import request from '@/utils/request';

export async function getApproversGdcByStartWithName(prefix) {
  return request(`${API_URL}/approvers/gdc/startwithname`, {
    params: {
      prefix: prefix,
    },
  }).then((response) => {
    return response;
  });
}
// getApproversGdcByAdAccount
export async function getApproversGdcByAdAccount(adAccount) {
  return request(`${API_URL}/approvers/gdc/adaccount`, {
    params: {
      adaccount: adAccount,
    },
  }).then((response) => {
    return response;
  });
}

export async function getApproversDbByStartWithName(prefix) {
  return request(`${API_URL}/approvers/db/startwithname`, {
    params: {
      prefix: prefix,
    },
  }).then((response) => {
    return response;
  });
}

export async function getApproversDbByStartWithEmail(prefix) {
  return request(`${API_URL}/approvers/db/startwithemail`, {
    params: {
      prefix: prefix,
    },
  }).then((response) => {
    return response;
  });
}
