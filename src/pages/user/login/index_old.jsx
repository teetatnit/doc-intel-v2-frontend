import { WindowsOutlined } from '@ant-design/icons';
import { Alert, Checkbox } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link, connect, useIntl, setLocale, getLocale } from 'umi';
import LoginForm from './components/Login';
import styles from './style.less';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = LoginForm;

const LoginMessage = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login = (props) => {
  const { userLogin = {}, submitting } = props;
  const { status, type: loginType } = userLogin;
  const [autoLogin, setAutoLogin] = useState(true);
  const [type, setType] = useState('SCG');
  const intl = useIntl();

  const handleSubmit = (values) => {
    const { dispatch } = props;
    dispatch({
      type: 'login/login',
      payload: { ...values, type },
    });
  };

  useEffect(() => {
    setLocale('en-US');
  }, []);

  return (
    <div className={styles.main}>
      <LoginForm activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
        <Tab
          key="SCG"
          tab={
            <span>
              <WindowsOutlined />
              Login with SCG AD
            </span>
          }
        >
          {status === 'error' && loginType === 'SCG' && !submitting && (
            <LoginMessage content="Login with SCG AD" />
          )}

          <UserName
            name="userName"
            addonAfter="@scg.com"
            placeholder={intl.formatMessage({ id: 'login.login.userName' })}
            rules={[
              {
                required: true,
                message: 'Please enter SCG AD Account',
              },
            ]}
          />
          <Password
            name="password"
            placeholder={intl.formatMessage({ id: 'login.login.password' })}
            rules={[
              {
                required: true,
                message: 'Please enter SCG AD Password',
              },
            ]}
          />
        </Tab>
        <div>
          <Checkbox checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)}>
            {intl.formatMessage({ id: 'login.login.remember-me' })}
          </Checkbox>
        </div>
        <Submit loading={submitting}> {intl.formatMessage({ id: 'login.login.loginBtn' })}</Submit>
      </LoginForm>
    </div>
  );
};

export default connect(({ login, loading }) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))(Login);
