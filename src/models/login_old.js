import { notification } from 'antd';
import { stringify } from 'querystring';
import { history } from 'umi';
import { AccountLogin, validateToken } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import { getPageQuery } from '@/utils/utils';

const Model = {
  namespace: 'login-old',
  state: {
    status: undefined,
  },
  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(AccountLogin, payload);

      if (response && response.ssoAccountType === 0) {
        // Save accountToken
        sessionStorage.setItem('token', response.ssoAccountToken);
        const validateResponse = yield call(validateToken, response.ssoAccountToken);

        if (validateResponse && validateResponse.isValid) {
          // Login successfully
          if (validateResponse.role && validateResponse.role === 'guest') {
            notification.error({
              message: 'No Permission',
              description:
                'You do not have access to the system, Please contact your administrator.',
              duration: 2,
            });
            yield put({
              type: 'changeLoginStatus',
              payload: {
                ssoAccountToken: response.ssoAccountToken,
                status: 'ok',
                currentAuthority: 'guest',
                isValid: true,
                ssoAccount: validateResponse.ssoAccount,
                fullName: validateResponse.employee[0].e_FullName,
              },
            });
          } else {
            yield put({
              type: 'changeLoginStatus',
              payload: {
                ssoAccountToken: response.ssoAccountToken,
                status: 'ok',
                currentAuthority: validateResponse.role,
                isValid: true,
                ssoAccount: validateResponse.ssoAccount,
                fullName: validateResponse.employee[0].e_FullName,
              },
            });
          }
        } else {
          notification.error({
            message: 'Login Failed',
            description: 'Please check your Username and Password again.',
            duration: 2,
            onClose: () => {
              window.location.href = '/';
            },
          });
          yield put({
            type: 'changeLoginStatus',
            payload: {
              status: 'error',
              currentAuthority: 'guest',
              isValid: false,
              ssoAccount: validateResponse.ssoAccount,
            },
          }); // Login failed
          window.location.href = '/';
        }

        // Reload Authorization
        reloadAuthorized();

        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;

        if (redirect) {
          const redirectUrlParams = new URL(redirect);

          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);

            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }

        history.replace(redirect || '/');
      } else {
        notification.error({
          message: 'Login Failed',
          description: 'Please check your Username and Password again.',
          duration: 2,
          onClose: () => {
            window.location.href = '/';
          },
        });
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: 'error',
            currentAuthority: 'guest',
            isValid: false,
            ssoAccount: validateResponse.ssoAccount,
          },
        }); // Login failed
        window.location.href = '/';
      }
    },

    logout() {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('sso');
      const { redirect } = getPageQuery();

      if (window.location.pathname !== '/user/login' && !redirect) {
        history.replace({
          pathname: '/user/login',
          // search: stringify({
          //   redirect: window.location.href,
          // }),
        });
      }
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload);
      return { ...state, status: payload.status, type: payload.type };
    },
  },
};
export default Model;
