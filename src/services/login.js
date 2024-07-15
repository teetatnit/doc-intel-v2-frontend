import axios from 'axios';
import request from '@/utils/request';

const urlSSOGetProfile = SSO2_GET_PROFILE;
const urlSSOGetToken = SSO2_GET_TOKEN;
const urlSSORevoke = SSO2_REVOKE;

export async function Login(params) {
  console.log('Login', params);
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function validateToken(token, account) {
  return request(`${API_URL.slice(0, -3)}/checktoken`, {
    method: 'POST',
    data: { account },
  });
}

export async function AccountLogin(params) {
  return request(`${API_URL}/account`, {
    method: 'POST',
    data: params,
  });
}

export const AccountLogout = async (token) => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: urlSSORevoke,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return axios
    .request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export async function getToken(code) {
  let data = JSON.stringify({
    code: code,
  });
  const url = urlSSOGetToken;
  const config = {
    method: 'POST',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  };
  return axios.request(config).then((res) => {
    return res.data;
  });
}

export async function getProfile(token) {
  const url = urlSSOGetProfile;
  const config = {
    method: 'GET',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  };
  return axios.request(config).then((res) => {
    return res.data;
  });
}
