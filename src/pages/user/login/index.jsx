import React, { useEffect } from 'react';
import { connect, setLocale } from 'umi';
import LoginForm from './components/Login';
import { getPageQuery } from '@/utils/utils';
import styles from './style.less';

const { Submit } = LoginForm;

const urlSSOLogin = SSO2_LOGIN;

const Login = (props) => {
  const TYPE = 'SCG';

  const handleSubmit = (values) => {
    const { dispatch } = props;
    dispatch({
      type: 'login/login',
      payload: { ...values, type: TYPE },
    });
  };

  const checkToken = () => {
    const ssoAccountToken = sessionStorage.getItem('token');

    if (ssoAccountToken) {
      handleSubmit();
    } else {
      const { access_token } = getPageQuery();

      if (access_token) {
        handleSubmit();
      } else {
        setTimeout(() => {
          window.location.href = urlSSOLogin;
        }, 2000);
      }
    }
  };

  useEffect(() => {
    setLocale('en-US');
    checkToken();
  }, []);

  return (
    <div className={styles.main}>
      <LoginForm activeKey={TYPE} onSubmit={handleSubmit}>
        <Submit loading={true}>{'Log in with SCG Email'}</Submit>
      </LoginForm>
    </div>
  );
};

export default connect(({ login, loading }) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))(Login);
