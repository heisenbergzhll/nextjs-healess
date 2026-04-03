import Typography from '@mui/material/Typography';
import {
  STORE_CONFIG,
  getKeyFromStorage,
  getLocalStorage,
} from '@store/local-storage';
import { PLACEHOLDER_IMG } from '@utils/Constants';
import { graphqlRequest } from '@utils/Fetcher';
import { getLocalStore, isMarketplaceEnable, parseQuery } from '@utils/Helper';
import PRODUCT_AGGRESSION from '@voguish/module-catalog/graphql/Aggregations.graphql';
import PRODUCTS_QUERY from '@voguish/module-catalog/graphql/Products.graphql';
import STORE_LIST from '@voguish/module-catalog/graphql/StoreList.query.graphql';
import {
  AggregationInterface,
  ProductsListInterface,
  ProductsResultInterface,
  SortFields,
} from '@voguish/module-catalog/types';
import SELLER_PATHS_QUERY from '@voguish/module-marketplace/graphql/SellerPaths.graphql';
import SELLER_QUERY from '@voguish/module-marketplace/graphql/SellersList.graphql';
import { IStore } from '@voguish/module-marketplace/type';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Containers from '@voguish/module-theme/components/ui/Container';
import type {
  CategoryPagePaths,
  NextPageWithLayout,
  PageOptions,
  PagePathProps,
} from '@voguish/module-theme/page';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
const SPBanner = dynamic(
  () => import('@voguish/module-marketplace/Seller/SellerProfile/ProfileBanner')
);
const Profile = dynamic(
  () =>
    import('@voguish/module-marketplace/Seller/SellerProfile/Profile/Profile')
);

interface SellerPageProps {
  data: unknown;
  products: ProductsResultInterface;
  aggregations: AggregationInterface[];
  sort: SortFields;
  loading?: boolean;
}

const SellerPage: NextPageWithLayout<SellerPageProps> = (prop) => {
  const { data, products, loading, aggregations, sort } = prop;
  interface SellerData {
    seller_id: number | string;
    shop_title?: string;
    shop_url?: string;
    banner_pic?: string | null;
    logo_pic?: string | null;
    order_count?: number;
    product_count?: number;
    seller_rating?: number;
    return_policy?: string | null;
    shipping_policy?: string | null;
    contact_number?: string | null;
    email?: string | null;
  }

  interface SellerPageData {
    sellerData: SellerData;
  }

  const sellerData: SellerData = (data as SellerPageData)?.sellerData;
  const storeData = getLocalStorage(STORE_CONFIG, true) || {};

  const baseUrl = storeData?.base_url;
  const marketplaceIsActive =
    getKeyFromStorage(STORE_CONFIG, 'marketplace_is_active') || false;
  return (
    <div>
      {marketplaceIsActive && (
        <ErrorBoundary>
          <Containers>
            <Typography variant="h4" mb={2}>
              {sellerData?.shop_title || 'Profile'}
            </Typography>
          </Containers>
          <SPBanner
            id={
              sellerData?.seller_id !== undefined
                ? String(sellerData.seller_id)
                : ''
            }
            banner={
              sellerData?.banner_pic != null && baseUrl != null
                ? `${baseUrl}media/avatar/${sellerData?.banner_pic}`
                : PLACEHOLDER_IMG
            }
            logo={
              sellerData?.logo_pic != null && baseUrl !== null
                ? `${baseUrl}media/avatar/${sellerData?.logo_pic}`
                : PLACEHOLDER_IMG
            }
            name={sellerData?.shop_title || sellerData?.shop_url || ''}
            orderCount={
              sellerData?.order_count !== undefined
                ? String(sellerData.order_count)
                : '0'
            }
            productCount={
              products?.total_count !== undefined
                ? String(products?.total_count)
                : '0'
            }
            rating={
              sellerData?.seller_rating !== undefined
                ? String(sellerData.seller_rating)
                : '0.0'
            }
          />
          <Containers className="pt-2.5">
            <Profile
              aggregations={aggregations as AggregationInterface[]}
              sort={sort}
              products={products}
              loading={loading}
              id={Number(sellerData?.seller_id)}
              rating={
                sellerData?.seller_rating !== undefined
                  ? String(sellerData.seller_rating)
                  : '0.0'
              }
              returnPolicy={sellerData.return_policy as string}
              shippingPolicy={sellerData.shipping_policy as string}
              contactNumber={sellerData.contact_number as string}
              email={sellerData?.email as string}
            />
          </Containers>
        </ErrorBoundary>
      )}
    </div>
  );
};

export default SellerPage;

export async function getStaticPaths() {
  const marketplaceIsActive = await isMarketplaceEnable();
  let paths: PagePathProps = [];
  if (!marketplaceIsActive) {
    paths = [];
    return {
      paths,
      fallback: 'blocking', // can also be true or false
    };
  }
  try {
    const { data } = await graphqlRequest({
      query: SELLER_PATHS_QUERY,
      variables: {
        filter: { is_seller: { eq: '1' } },
        currentPage: 1,
        pageSize: 1500,
        sort: {},
      },
    });
    const sellersList = data?.sellersList?.items || [];
    paths = sellersList?.map((store: IStore) => ({
      params: {
        urlKey: [store.shop_url || '404'],
      },
    }));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log('Error fetching seller paths', error);
    paths = [];
  }
  return {
    paths,
    fallback: 'blocking', // can also be true or false
  };
}

export async function getStaticProps({ params, locale }: CategoryPagePaths) {
  // const { params } = props;

  const [urlKey, query] = parseQuery(params);
  const marketplaceIsActive = await isMarketplaceEnable();
  if (!marketplaceIsActive) {
    return {
      notFound: true,
    };
  }

  try {
    const storListResponse = await graphqlRequest({
      query: STORE_LIST,
      variables: {},
    });
    const stores = storListResponse?.availableStores || [];

    const sellerData = await graphqlRequest({
      query: SELLER_QUERY,
      variables: {
        filter: { shop_url: { eq: urlKey || null } },
      },
      options: {
        context: {
          headers: {
            Store: getLocalStore(stores, locale as string),
          },
        },
      },
    });
    console.log(sellerData, ' sellerData ');

    const sellerId = sellerData?.sellersList?.items[0]?.seller_id;

    if (!sellerId) {
      return {
        notFound: true,
      };
    }

    if (sellerId) {
      const productsQueryInput: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filters: { [key: string]: any };
        search: string;
        currentPage: number;
        pageSize: number;
        sort?: { [key: string]: string };
      } = {
        filters: {
          seller_id: { eq: sellerId },
        },
        search: '',
        currentPage: 1,
        pageSize: 20, // default value, can be overridden
        sort: {
          position: 'DESC',
        },
      };
      query?.reduce<string | undefined>((param, value) => {
        if (!param) return value;
        if (param === 'sort') {
          const sortRange = value.split('_');
          productsQueryInput.sort = {
            position: 'DESC',
            [sortRange[0]]: sortRange[1].toUpperCase(),
          };
        } else if (param === 'limit') {
          productsQueryInput.pageSize = Number(value);
        } else if (param === 'page') {
          productsQueryInput.currentPage = Number(value);
        } else if (param === 'category_uid') {
          productsQueryInput.filters = {
            ...productsQueryInput.filters,
            category_uid: { eq: value },
          };
        } else if (param === 'price') {
          const priceRange = value.split('_');
          const filterValue = { from: priceRange[0], to: priceRange[1] };
          productsQueryInput.filters = {
            ...productsQueryInput.filters,
            price: filterValue,
          };
        } else {
          productsQueryInput.filters = {
            ...productsQueryInput.filters,
            [param]: { eq: value },
          };
        }
        return undefined;
      }, undefined);

      const storListResponse = await graphqlRequest({
        query: STORE_LIST,
        variables: {},
      });
      const stores = storListResponse?.data?.availableStores || [];
      const productsData: ProductsListInterface = await graphqlRequest({
        query: PRODUCTS_QUERY,
        variables: productsQueryInput,
        options: {
          context: {
            headers: {
              Store: getLocalStore(stores, locale as string),
            },
          },
          fetchPolicy: 'no-cache',
        },
      });
      const aggregations: ProductsListInterface = await graphqlRequest({
        query: PRODUCT_AGGRESSION,
        variables: productsQueryInput,
        options: {
          context: {
            headers: {
              Store: getLocalStore(stores, locale as string),
            },
          },
          fetchPolicy: 'network-only',
        },
      });
      const pageProps: PageOptions = {
        title: 'Seller Profile',
        description: 'Seller Profile',
        showBreadcrumb: true,
      };
      return {
        props: {
          ...(await serverSideTranslations(locale as string, ['common'])),
          aggregations: aggregations?.products?.aggregations || [],
          sort: aggregations?.products?.sort_fields || {},
          pageOptions: pageProps,
          data: { sellerData: sellerData?.sellersList.items[0] },
          products: productsData?.products,
        },
        revalidate: 60, // Time In which it revalidate or check for changes
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log('Error fetching seller data', error);
    JSON.stringify(error, null, 2);
    return {
      notFound: true,
    };
  }

  return {
    notFound: true,
  };
}
