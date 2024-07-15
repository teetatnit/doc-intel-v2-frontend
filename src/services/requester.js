import request from '@/utils/request';

// export async function getRequestersGdcByStartWithName(prefix) {
//   return request(`${API_URL}/requesters/gdc/startwithname`, {
//     params: {
//       prefix: prefix,
//     },
//   }).then((response) => {
//     return response;
//   });
// }
// // getRequestersGdcByAdAccount
// export async function getRequestersGdcByAdAccount(adAccount) {
//   return request(`${API_URL}/requesters/gdc/adaccount`, {
//     params: {
//       adaccount: adAccount,
//     },
//   }).then((response) => {
//     return response;
//   });
// }

export async function getRequestersDbByStartWithName(prefix) {
  return request(`${API_URL}/requesters/db/startwithname`, {
    params: {
      prefix: prefix,
    },
  }).then((response) => {
    return response;
  });
}

export async function getRequestersDbByStartWithEmail(prefix) {
  return request(`${API_URL}/requesters/db/startwithemail`, {
    params: {
      prefix: prefix,
    },
  }).then((response) => {
    return response;
  });
}
