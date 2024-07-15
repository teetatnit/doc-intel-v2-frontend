module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
    API_URL: true,
    API_IFRAME_URL: true,
    SSO2_LOGIN: true,
    SSO2_GET_TOKEN: true,
    SSO2_GET_PROFILE: true,
    SSO2_LOGOUT: true,
    SSO2_REVOKE: true,
  },
};
