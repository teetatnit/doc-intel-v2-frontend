/*
Revisor:            Chanakan C.
Revision date:      24/May/2021
Revision Reason:    Change locales list
*/

import { GlobalOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { getLocale, setLocale } from 'umi';
import React from 'react';
import classNames from 'classnames';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

const SelectLang = props => {
  const { className } = props;
  const selectedLang = getLocale();

  const changeLang = ({ key }) => setLocale(key);

  // ***** 24/May/2021 Chanakan C. Mod Start ***** //
  const locales = ['en-US'];
  const languageLabels = {
    'en-US': 'English',
  };
  const languageIcons = {
    'en-US': '🇺🇸',
  };
  // ***** 24/May/2021 Chanakan C. Mod End ***** //
  const langMenu = (
    <Menu className={styles.menu} selectedKeys={[selectedLang]} onClick={changeLang}>
      {locales.map(locale => (
        <Menu.Item key={locale}>
          <span role="img" aria-label={languageLabels[locale]}>
            {languageIcons[locale]}
          </span>{' '}
          {languageLabels[locale]}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <HeaderDropdown overlay={langMenu} placement="bottomRight">
      <span className={classNames(styles.dropDown, className)}>
        <GlobalOutlined title="Language" />
      </span>
    </HeaderDropdown>
  );
};

export default SelectLang;
