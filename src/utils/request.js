/**
 * request api : https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';

const codeMessage = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'The requested resource could not be found',
  406: 'Not Acceptable',
  410: 'The requested resource is permanently deleted and will not be retrieved.',
  422: 'A validation error occurred when creating an object.',
  500: 'An error occurred on the server.',
  502: 'Gateway Error',
  503: 'Service is unavailable, server is temporarily overloaded or maintained',
  504: 'Gateway Timeout',
};

const errorHandler = (error) => {
  const { response } = error;
  let errorText = '';
  if (response && response.status) {
    errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    notification.error({
      message: `Request error ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    errorText = 'Cannot connect to the server';
    notification.error({
      message: 'Network Error',
      description: errorText,
    });
  }
  return Object.assign(response, { errorText: errorText });
};

// const authen = 'Basic ' + btoa('rpaUserPO' + ":" + 'F[oyl8xu');

const request = extend({
  errorHandler,
  // credentials: '',
});

request.interceptors.request.use((url, options) => {
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  };
  return {
    url: `${url}`,
    options: {
      ...options,
      interceptors: true,
    },
  };
});

export default request;
