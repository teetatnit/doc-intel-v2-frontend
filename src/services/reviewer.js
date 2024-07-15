import request from '@/utils/request';

// export async function getReviewersGdcByStartWithName(prefix) {
//   return request(`${API_URL}/reviewers/gdc/startwithname`, {
//     params: {
//       prefix: prefix,
//     },
//   }).then((response) => {
//     return response;
//   });
// }
// // getReviewersGdcByAdAccount
// export async function getReviewersGdcByAdAccount(adAccount) {
//   return request(`${API_URL}/reviewers/gdc/adaccount`, {
//     params: {
//       adaccount: adAccount,
//     },
//   }).then((response) => {
//     return response;
//   });
// }

export async function getReviewersDbByStartWithName(prefix) {
  return request(`${API_URL}/reviewers/db/startwithname`, {
    params: {
      prefix: prefix,
    },
  }).then((response) => {
    return response;
  });
}

export async function getReviewersDbByStartWithEmail(prefix) {
  return request(`${API_URL}/reviewers/db/startwithemail`, {
    params: {
      prefix: prefix,
    },
  }).then((response) => {
    return response;
  });
}
