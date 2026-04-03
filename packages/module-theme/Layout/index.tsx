import { useQuery } from '@apollo/client';
import { client, httpLink, setStoreCode } from '@lib/apollo-client';
import Divider from '@mui/material/Divider';
import { RootState } from '@store';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getLocalStorage } from '@store/local-storage';
import { setUser } from '@store/user';
import { BRAND_HEX_CODE, LOADING } from '@utils/Constants';
import { isValidArray, isValidObject } from '@utils/Helper';
import { decodeHtml } from '@utils/decode';
import { useSetAddressCountries } from '@voguish/module-customer/hooks/customer-handler';
import { useCreateEmptyCart } from '@voguish/module-quote/hooks';
import { useStoreConfig } from '@voguish/module-store';
import Robots from '@voguish/module-theme/graphql/Robots.graphql';
import { PageOptions } from '@voguish/module-theme/page';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, ReactNode, useCallback, useEffect, useState } from 'react';
import { ClientPortal } from '../components/ClientPortal';
import { SpeculationRules } from '../components/SpeculationRuler';
import Toast from '../components/toast';
import { ColumnContainer } from '../components/ui/ColumnContainer';
import Containers from '../components/ui/Container';
import Loader from '../components/ui/Form/Elements/Loader';
import { FooterPlaceHolder } from '../components/widgets/placeholders/FooterPlaceHolder';
import { NewsLetterPlaceHolder } from '../components/widgets/placeholders/NewsLetterPlaceHolder';
import Header from './Header';
import { InfoProvider } from './Header/Provider/InfoProvider';
import CustomerWrapper from './PageWrapper/Customer';
import GuestWrapper from './PageWrapper/Guest';

const Footer = dynamic(() => import('./Footer'), {
  loading: () => <FooterPlaceHolder />,
  ssr: false,
});
const Breadcrumbs = dynamic(
  () => import('@voguish/module-theme/components/ui/Breadcrumbs'),
  {
    loading: () => (
      <Containers className="my-6">
        <div className="relative w-full h-6 max-w-xl bg-gray-300 rounded-md animate-pulse" />
      </Containers>
    ),
    ssr: false,
  }
);
const Newsletter = dynamic(
  () => import('@voguish/module-theme/components/widgets/Newsletter'),
  { loading: () => <NewsLetterPlaceHolder />, ssr: false }
);

/**
 * Page Layout - Page setup
 * @param param0
 * @returns
 */
const Layout = ({
  children,
  pageOptions: {
    title,
    showBreadcrumb = true,
    description,
    breadCrumbs,
    metaKeywords,
    canonical = process?.env?.MAGENTO_ENDPOINT || '',
  },
}: {
  children: ReactNode;
  pageOptions: PageOptions;
}) => {
  const [isAccountLoggedIn, setIsAccountLoggedIn] = useState(false);
  const dispatch = useAppDispatch();
  useSetAddressCountries();
  const { data: session, status } = useSession();

  const { data: storeData, loading: storeLoading } = useStoreConfig({
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const storeConfig = storeData?.storeConfig;
  const baseUrl = storeConfig?.base_url;
  const favIcon = storeConfig?.head_shortcut_icon;

  useEffect(() => {
    if (isValidObject(session)) {
      dispatch(setUser(session));
      setIsAccountLoggedIn(true);
    }
  }, [session]);
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;

  const currency = useAppSelector(
    (state: RootState) =>
      state?.storeConfig?.currentCurrency?.currency_to ?? null
  );

  const { data } = useQuery(Robots, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  const { t, i18n } = useTranslation('common');

  const clientSideLanguageChange = useCallback(() => {
    i18n.changeLanguage(locale);
  }, [i18n, locale]);

  useEffect(() => {
    document.dir = locale === 'ar' ? 'rtl' : 'ltr';
    clientSideLanguageChange();
  }, [clientSideLanguageChange, locale]);

  const storeCode = getLocalStorage('current_store');
  useEffect(() => {
    client.setLink(
      setStoreCode(storeCode || process.env.DEFAULT_STORE_CODE || '').concat(
        httpLink
      )
    );
  }, [locale, storeCode]);

  useEffect(() => {
    router.replace({ pathname, query }, asPath);
  }, [currency]);
  const [emptyHitCount, setEmptyHitCount] = useState(0);
  const guestId = useAppSelector((state) => state?.cart?.quote);

  const cartId = guestId?.id ?? null;
  const emptyCart = useCreateEmptyCart();

  useEffect(() => {
    if (!cartId && emptyHitCount <= 2) {
      emptyCart();
      setEmptyHitCount((prevCount: number) => prevCount + 1);
    } else if (cartId) {
      setEmptyHitCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId]);

  return (
    <Fragment>
      <Head>
        {!storeLoading && (
          <link
            rel="shortcut icon"
            href={baseUrl ? `${baseUrl}media/favicon/${favIcon}` : ''}
          />
        )}
        {!storeLoading && (
          <meta
            name="msapplication-TileImage"
            content={baseUrl ? `${baseUrl}media/favicon/${favIcon}` : ''}
          />
        )}
        <meta name="theme-color" content={BRAND_HEX_CODE} />
        <meta name="msapplication-TileColor" content={BRAND_HEX_CODE} />
        {data?.searchEngineRobots?.defaultRobots && (
          <meta
            name="robots"
            content={data?.searchEngineRobots?.defaultRobots}
          />
        )}
        <link
          rel="preconnect"
          href={process?.env?.MAGENTO_ENDPOINT || ''}
          crossOrigin="anonymous"
        />
        <meta property="og:locale" content={locale} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta
          property="og:url"
          content={process?.env?.MAGENTO_ENDPOINT || ''}
        />
        <meta property="og:site_name" content="Voguish" />

        <title>
          {t(`${decodeHtml(title || storeConfig?.default_title || 'Voguish')}`)}
        </title>
        <meta
          name="title"
          content={t(
            decodeHtml(title || storeConfig?.default_title || 'Voguish')
          )}
        />
        <meta
          name="keywords"
          content={metaKeywords || storeConfig?.default_keywords}
        />
        {canonical && <link rel="canonical" href={canonical} />}
        <meta name="viewport" content="initial-scale=1, width=device-width" />

        <meta
          name="description"
          content={t(
            decodeHtml(
              description || storeConfig?.default_description || 'Voguish'
            )
          )}
        />
      </Head>

      {status === LOADING ? (
        <Loader />
      ) : (
        <InfoProvider>
          <main
            aria-labelledby={t(decodeHtml(title || 'Voguish'))}
            className="grid content-between mt-[4rem] min-h-screen mx-auto overflow-x-hidden antialiased scroll-mt-5 scroll-smooth"
          >
            <div>
              <Header isAccountLoggedIn={isAccountLoggedIn} />
              {(showBreadcrumb || isValidArray(breadCrumbs)) && (
                <ColumnContainer>
                  <Breadcrumbs breadCrumbs={breadCrumbs} title={title} />
                </ColumnContainer>
              )}
            </div>

            {session?.user?.token ? (
              <CustomerWrapper>{children}</CustomerWrapper>
            ) : (
              <GuestWrapper>{children} </GuestWrapper>
            )}
            <div>
              <div className="mx-auto mb-6 mt-16 grid w-full max-w-[125rem] gap-y-16 bg-white">
                <Divider />
                <Newsletter />
              </div>
              <Footer />
            </div>
          </main>
        </InfoProvider>
      )}
      <SpeculationRules />
      <ClientPortal selector="#alerts">
        <Toast />
      </ClientPortal>
    </Fragment>
  );
};

export default Layout;
