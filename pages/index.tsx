import { LRUCache } from '@utils/LRUCache';
import { graphqlRequest } from '@utils/Fetcher';
import { getLocalStore, isValidObject } from '@utils/Helper';
import STORE_LIST from '@voguish/module-catalog/graphql/StoreList.query.graphql';
import HOME_PAGE_QUERY from '@voguish/module-theme/graphql/home.graphql';
import { PageOptions } from '@voguish/module-theme/page';
import HomePage from '@voguish/module-theme/pages/Home';
import { HomePageData } from '@voguish/module-theme/types/home-page';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';

const homePageCache = new LRUCache<any>(50, 1);

const Home = ({ pageData }: { pageData: HomePageData }) => {
  return (
    <div className="mx-auto w-full 4xl:max-w-[160.5rem]">
      <HomePage pageData={pageData} />
    </div>
  );
};

export default Home;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const locale = context.locale as string;
  const pageProps: PageOptions = {
    title: 'Home Page - Voguish',
    description: 'Welcome to Voguish Theme',
    showBreadcrumb: false,
  };

  try {
    const session = await getSession(context);
    const token = session?.user?.token || (session as any)?.accessToken || null;
    // Add token to cache key to prevent sharing authenticated data across users
    const cacheKey = token ? `homepage_${locale}_${token}` : `homepage_${locale}`;
    const cachedData = homePageCache.get(cacheKey);

    if (cachedData) {
      return {
        props: {
          ...(await serverSideTranslations(locale, ['common'])),
          pageOptions: pageProps,
          pageData: cachedData.pageData,
        },
      };
    }
    const storeListResponse = await graphqlRequest({
      query: STORE_LIST,
      variables: {},
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
    });
    const stores = storeListResponse?.availableStores || [];
    const selectedStore = getLocalStore(stores, locale);
    if (!selectedStore) {
      console.warn(`No store found for locale: ${locale}`);
      return { notFound: true };
    }

    const homePageResponse = await graphqlRequest({
      query: HOME_PAGE_QUERY,
      variables: {},
      options: {
        context: {
          headers: {
            store: selectedStore,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
        fetchPolicy: 'no-cache',
      },
    });

    const pageData = homePageResponse;

    homePageCache.set(cacheKey, {
      pageData,
    });

    if (!isValidObject(pageData)) {
      return { notFound: true };
    }

    return {
      props: {
        ...(await serverSideTranslations(locale, ['common'])),
        pageOptions: pageProps,
        pageData,
      },
    };
  } catch (error) {
    console.error('Home page query error : ', error);
    return {
      notFound: true,
    };
  }
}
