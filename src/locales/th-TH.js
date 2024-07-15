import component from './th-TH/component';
import globalHeader from './th-TH/globalHeader';
import menu from './th-TH/menu';
import login from './th-TH/login';
import pwa from './th-TH/pwa';
import settingDrawer from './th-TH/settingDrawer';
import settings from './th-TH/settings';
import page from './th-TH/page';

export default {
    'navBar.lang': 'Languages',
    // ***** 15/05/2021 Apiwat Emem Modify Start ***** //
    'layout.user.link.help': 'Help',
    'layout.user.link.privacy': 'Privacy',
    'layout.user.link.terms': 'Terms',
    // ***** 15/05/2021 Apiwat Emem Modify End ***** //
  'app.preview.down.block': 'Download this page to your local project',
  'app.welcome.link.fetch-blocks': 'Get all block',
  'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',
  ...globalHeader,
  ...menu,
  ...login,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...page,
};
