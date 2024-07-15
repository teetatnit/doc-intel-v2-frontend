import React, { useState, useEffect } from 'react';
import { getPageQuery } from '@/utils/utils';
import { Skeleton, Result, Button } from 'antd';
import { validateToken, getToken, getProfile } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';

const urlSSOLogin = SSO2_LOGIN;

const LoginCallback = ({ location }) => {
  const [isValid, setValid] = useState(0);

  const checkToken = async () => {
    let ssoAccountToken = '';

    if (sessionStorage.getItem('token')) {
      ssoAccountToken = sessionStorage.getItem('token');
    }

    const { code } = getPageQuery();
    if (code !== null) {
      sessionStorage.setItem('code', code);
      try {
        const responseGetToken = await getToken(code);
        ssoAccountToken = responseGetToken['token'];
      } catch (error) {
        console.log(error);
      }
    }

    let payload = {
      ssoAccountToken: '',
      status: '',
      currentAuthority: '',
      isValid: false,
      bu: 'OTHER',
      ssoAccount: '',
      fullName: '',
    };

    if (ssoAccountToken) {
      // Save Account Token
      sessionStorage.setItem('token', ssoAccountToken);
      try {
        const responseGetProfile = await getProfile(ssoAccountToken);
        const email = responseGetProfile.email;
        const validateResponse = await validateToken(ssoAccountToken, email);
        if (validateResponse && validateResponse.hasOwnProperty('role')) {
          const { role, ssoAccount, name, bu } = validateResponse;

          // Login successfully
          if (role === 'guest') {
            payload = {
              ssoAccountToken,
              status: 'ok',
              currentAuthority: 'guest',
              isValid: true,
              bu: bu,
              ssoAccount,
              fullName: name,
            };
            setAuthority(payload);
            setValid(1);
          } else {
            //role admin
            payload = {
              ssoAccountToken,
              status: 'ok',
              currentAuthority: role,
              isValid: true,
              bu: bu,
              ssoAccount,
              fullName: name,
            };
            setAuthority(payload);
            setValid(1);
          }
        } else {
          payload = {
            ssoAccountToken: '',
            status: 'error',
            currentAuthority: 'guest',
            isValid: false,
            bu: 'OTHER',
            ssoAccount: validateResponse.data.ssoAccount,
            fullName: '',
          };
          setAuthority(payload);
          // window.location.href = '/';
        }

        // Reload Authorization
        // reloadAuthorized();

        setTimeout(() => {
          window.location.replace('/ExtractDataAI');
        }, 500);
      } catch (error) {
        console.log(error);
        window.location.href = urlSSOLogin;
      }
    } else {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  console.log('isValid ' + isValid);

  if (isValid === 0) {
    return (
      <div className="Please wait..">
        <div style={{ textAlign: 'center', fontSize: 25 }}>Please wait..</div>
      </div>
    );
  } else {
    return <Skeleton active />;
  }
};

export default LoginCallback;
