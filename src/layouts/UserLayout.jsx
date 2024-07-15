import { DefaultFooter, getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link, useIntl, connect } from 'umi';
import React from 'react';
import SelectLang from '@/components/SelectLang';
import logo from '../assets/logo.png';
import styles from './UserLayout.less';

const UserLayout = props => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { formatMessage } = useIntl();
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    formatMessage,
    breadcrumb,
    ...props,
  });
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.lang}>
          <SelectLang />
        </div>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>Document Intelligent V2</span>
              </Link>
            </div>
            <div className={styles.desc}>SCG Document Intelligent V2</div>
          </div>
          {children}
        </div>
        <DefaultFooter
          copyright="2021 SCG Chemicals, Document Intelligent Version 2.0.1"
          links={[
            {
              key: 'privacy',
              title: 'Privacy Notice',
              href: 'https://www.scg.com/th/09legal_privacy/privacy-employee.html',
              blankTarget: true,
            },
            {
              key: 'cookie',
              title: 'Cookie Notice',
              href: 'https://www.scg.com/th/09legal_privacy/cookie.html',
              blankTarget: true,
            },
            {
              key: 'terms',
              title: 'Terms of use',
              href: 'https://www.scg.com/th/09legal_privacy/privacy-and-notice.html',
              blankTarget: true,
            },
          ]}
        />
      </div>
    </HelmetProvider>
  );
};

export default connect(({ settings }) => ({ ...settings }))(UserLayout);
