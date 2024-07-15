import { notification } from 'antd';
import { history } from 'umi';
import { validateToken, AccountLogout, getToken, getProfile } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import { getPageQuery } from '@/utils/utils';

const urlSSOLogin = SSO2_LOGIN;
const urlSSOLogout = SSO2_LOGOUT;

const Model = {
  namespace: 'login',
  state: {
    status: undefined,
  },
  effects: {
    *login({}, { call, put }) {
      let ssoAccountToken = '';

      if (sessionStorage.getItem('token')) {
        ssoAccountToken = sessionStorage.getItem('token');
      }

      const { code } = getPageQuery();
      if (code !== null) {
        sessionStorage.setItem('code', code);
        try {
          const responseGetToken = yield call(getToken, code);
          ssoAccountToken = responseGetToken['token'];
        } catch (error) {
          console.log(error);
        }
      }

      if (ssoAccountToken) {
        // Save Account Token
        sessionStorage.setItem('token', ssoAccountToken);

        try {
          const responseGetProfile = yield call(getProfile, ssoAccountToken);
          const email = responseGetProfile.email;
          const validateResponse = yield call(validateToken, ssoAccountToken, email);
          if (validateResponse && validateResponse.hasOwnProperty('role')) {
            const { role, ssoAccount, employee, name, bu } = validateResponse;

            // Login successfully
            if (role === 'guest') {
              notification.error({
                message: 'No Permission',
                description:
                  'You do not have access to the system, Please contact your administrator.',
                duration: 2,
              });

              yield put({
                type: 'changeLoginStatus',
                payload: {
                  ssoAccountToken,
                  status: 'ok',
                  currentAuthority: 'guest',
                  isValid: true,
                  bu: bu,
                  ssoAccount,
                  fullName: employee[0].e_FullName,
                },
              });
            } else {
              yield put({
                type: 'changeLoginStatus',
                payload: {
                  ssoAccountToken,
                  status: 'ok',
                  currentAuthority: role,
                  isValid: true,
                  bu: bu,
                  ssoAccount,
                  fullName: employee.length > 0 ? employee[0].e_FullName : name,
                },
              });
            }
          } else {
            // Login failed
            notification.error({
              message: 'Login Failed',
              description: 'Please check your Username and Password again.',
              duration: 2,
            });

            yield put({
              type: 'changeLoginStatus',
              payload: {
                status: 'error',
                currentAuthority: 'guest',
                isValid: false,
                bu: 'OTHER',
                ssoAccount: validateResponse.ssoAccount,
              },
            });

            window.location.href = '/';
          }

          // Reload Authorization
          reloadAuthorized();

          setTimeout(() => {
            history.replace(redirect || '/');
          }, 2000);
        } catch (error) {
          console.log(error);
          window.location.href = urlSSOLogin;
        }
      } else {
        // Login failed
        notification.error({
          message: 'Login Failed',
          description: 'Please check your Username and Password again.',
          duration: 2,
        });

        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: 'error',
            currentAuthority: 'guest',
            isValid: false,
            bu: 'OTHER',
            ssoAccount: validateResponse.ssoAccount,
          },
        });

        window.location.href = '/';
      }
    },

    async logout() {
      const ssoAccountToken = sessionStorage.getItem('token');

      sessionStorage.removeItem('token');
      sessionStorage.removeItem('sso');

      const logoutSystem = await AccountLogout(ssoAccountToken);

      if (logoutSystem) {
        const logoutAD = window.open(urlSSOLogout);

        setTimeout(() => {
          logoutAD.close();
          window.location.href = '/';
        }, 1000);
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
