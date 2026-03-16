import { LRUCache } from '@utils/ LRUCache';
import { graphqlRequest } from '@utils/Fetcher';
import { getLocalStore, isValidObject } from '@utils/Helper';
import STORE_LIST from '@voguish/module-catalog/graphql/StoreList.query.graphql';
import HOME_PAGE_QUERY from '@voguish/module-theme/graphql/home.graphql';
import { PageOptions } from '@voguish/module-theme/page';
import HomePage from '@voguish/module-theme/pages/Home';
import { HomePageData } from '@voguish/module-theme/types/home-page';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const homePageCache = new LRUCache<any>(50, 5);


const Home = ({ pageData }: { pageData: HomePageData }) => {
  return (
    <div className="mx-auto w-full 4xl:max-w-[160.5rem]">
      <HomePage pageData={pageData} />
    </div>
  );
};

export default Home;

export async function getServerSideProps({ locale }: { locale: string }) {
  const pageProps: PageOptions = {
    title: 'Home Page - Unineed',
    description: 'Welcome to Unineed',
    showBreadcrumb: false,
  };

  try {
    const cacheKey = `homepage_${locale}`;
    const cachedData = homePageCache.get(cacheKey);
    console.log('cachedData', cachedData)

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
    console.log('fetch storeListResponse---', storeListResponse)
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
            Store: selectedStore,
          },
        },
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
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
