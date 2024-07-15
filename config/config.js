/*
Revisor:            Chanakan C.
Revision date:      31/May/2021
Revision Reason:    Add azureStorage & formrecognizer
*/

// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
const {
  REACT_APP_ENV,
  API_URL,
  API_IFRAME_URL,
  SSO2_LOGIN,
  SSO2_GET_TOKEN,
  SSO2_GET_PROFILE,
  SSO2_LOGOUT,
  SSO2_REVOKE,
} = process.env;
export default defineConfig({
  pwa: false,
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    // ***** 31/May/2021 Chanakan C. Mod Start ***** //
    default: 'en-US',
    // ***** 31/May/2021 Chanakan C. Mod End ***** //
    // default true, when it is true, will use `navigator.language` overwrite default
    antd: false,
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  define: {
    API_URL: API_URL,
    API_IFRAME_URL: API_IFRAME_URL,
    SSO2_LOGIN: SSO2_LOGIN,
    SSO2_GET_TOKEN: SSO2_GET_TOKEN,
    SSO2_GET_PROFILE: SSO2_GET_PROFILE,
    SSO2_LOGOUT: SSO2_LOGOUT,
    SSO2_REVOKE: SSO2_REVOKE,
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './user/login',
        },
        {
          name: '注册页',
          icon: 'smile',
          path: '/userregister',
          component: './UserRegister',
        },
      ],
    },
    {
      path: '/callback',
      component: '../layouts/UserLayout',
      routes: [
        {
          name: 'callback',
          path: '/callback',
          component: './LoginCallback',
        },
      ],
    },
    {
      path: '/',
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          authority: ['admin', 'user'],
          routes: [
            {
              path: '/',
              redirect: '/ExtractDataAI',
            },
            {
              path: '/ExtractDataAI',
              icon: 'upload',
              name: 'list.table-list-ai',
              component: './ExtractDataAI',
              authority: ['admin', 'user'],
            },
            // {
            //   path: '/ExtractData',
            //   icon: 'upload',
            //   name: 'list.table-list',
            //   component: './ExtractData',
            //   authority: ['admin', 'user'],
            // },
            // {
            //   path: '/Train',
            //   icon: 'fontSize',
            //   name: 'list.train',
            //   component: './Train',
            //   authority: ['admin', 'user'],
            // },
            {
              path: '/MasterData',
              name: 'list.masterdata',
              icon: 'database',
              component: './MasterData',
              authority: ['admin', 'user'],
            },
            {
              path: '/Vendor',
              name: 'vendor',
              icon: 'team',
              component: './Vendor',
              authority: ['user'],
            },
            {
              path: '/admin',
              name: 'admin',
              icon: 'crown',
              authority: ['admin'],
              routes: [
                {
                  path: '/admin/User',
                  name: 'usermanagement',
                  icon: 'user',
                  component: './User',
                  authority: ['admin'],
                },
                {
                  path: '/admin/BusinessUnit',
                  name: 'businessunit',
                  icon: 'cluster',
                  component: './BusinessUnit',
                  authority: ['admin'],
                },
                {
                  path: '/admin/Company',
                  name: 'company',
                  icon: 'home',
                  component: './Company',
                  authority: ['admin'],
                },
                // {
                //   path: '/admin/Division',
                //   name: 'division',
                //   icon: 'apartment',
                //   component: './Division',
                //   authority: ['admin'],
                // },
                {
                  path: '/admin/Vendor',
                  name: 'vendor',
                  icon: 'team',
                  component: './Vendor',
                  authority: ['admin'],
                },
                {
                  path: '/admin/Expense',
                  name: 'expense',
                  icon: 'team',
                  component: './Expense',
                  authority: ['admin'],
                },
                {
                  path: '/admin/CostCenter',
                  name: 'costcenter',
                  icon: 'team',
                  component: './CostCenter',
                  authority: ['admin'],
                },
                {
                  path: '/admin/Beneficiary',
                  name: 'beneficiary',
                  icon: 'bank',
                  component: './Beneficiary',
                  authority: ['admin'],
                },
                /*
                {
                  path: '/admin/OCRMaster',
                  name: 'master',
                  icon: 'database',
                  component: './UploadOCRMasterData',
                  authority: ['admin', 'user'],
                },
                */
              ],
            },
            {
              component: './404',
            },
          ],
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme
  theme: {
    'primary-color': defaultSettings.primaryColor,
    // ***** 31/May/2021 Chanakan C. Add Start ***** //
    'switch-color': '#33cc00',
    'alert-info-bg-color': '#Eff6f7',
    'alert-info-border-color': '#cce0ff',
    'alert-info-icon-color': '#d6d6c2',
    // ***** 31/May/2021 Chanakan C. Add End ***** //
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});
