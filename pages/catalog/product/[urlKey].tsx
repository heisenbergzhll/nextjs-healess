import { graphqlRequest } from '@utils/Fetcher';
import { getLocalStore, isValidObject } from '@utils/Helper';
import PRODUCT_QUERY from '@voguish/module-catalog/graphql/Product.graphql';
import PRODUCT_PATH_QUERY from '@voguish/module-catalog/graphql/ProductsPath.graphql';
import {
  ProductItemInterface,
  ProductsListInterface,
} from '@voguish/module-catalog/types';
import {
  PageOptions,
  PagePathProps,
  PagePaths,
} from '@voguish/module-theme/page';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Containers from '@packages/module-theme/components/ui/Container';
import dynamic from 'next/dynamic';
import ProductPlaceholder from '@packages/placeholder/ProductDetail';
import { Suspense } from 'react';
import STORE_LIST from '@voguish/module-catalog/graphql/StoreList.query.graphql';

const Detail = dynamic(
  () =>
    import('@voguish/module-catalog/Components/Product/Detail/page/Details'),
  {
    ssr: false,
    loading: () => (
      <Containers>
        <ProductPlaceholder />
      </Containers>
    ),
  }
);
const Product = ({
  product,
}: {
  product: ProductItemInterface;
  urlKey: string;
}) => {
  const router = useRouter();

  return (
    <Suspense
      fallback={
        <Containers>
          <ProductPlaceholder />
        </Containers>
      }
    >
      <Detail product={product} loading={router.isFallback} />
    </Suspense>
  );
};

export default Product;

/**
 * Get static Props: getting all the paths for pre rendering
 *
 * @returns {Object} props
 */
export async function getStaticPaths() {
  // Initialize paths as an empty array
  let paths: PagePathProps = [];

  // Only run the GraphQL request in production

  try {
    if (process.env.MODE === 'PRODUCTION') {
      // Perform the GraphQL request
      const data: ProductsListInterface = await graphqlRequest({
        query: PRODUCT_PATH_QUERY,
        variables: { filters: {}, pageSize: 1000 },
      });
      // Check if the data is valid and contains products
      if (data?.products?.items) {
        const products = data.products.items;

        // Map over products to create paths
        paths = products.map((product) => ({
          params: { urlKey: product?.url_key || '404' }, // Default to '404' if url_key is missing
        }));
      } else {
        // Handle case where data is not as expected
        throw new Error('Unexpected data format:');
      }
    } else {
      paths = [];
    }
  } catch (error) {
    console.log('Product detail :', error);
    paths = [];
  }

  // Return paths with fallback behavior
  return { paths, fallback: 'blocking' };
}

/**
 * Generating data at build time.
 *
 * @param {*} param0
 * @returns {JSON} props
 */
export async function getStaticProps({ params, locale }: PagePaths) {
  try {
    if (!params?.urlKey || !locale) {
      throw new Error('Missing parameters or locale');
    }

    const storListResponse = await graphqlRequest({
      query: STORE_LIST,
      variables: {},
    });
    const stores = storListResponse?.data?.availableStores || [];

    const data: ProductsListInterface = await graphqlRequest({
      query: PRODUCT_QUERY,
      variables: {
        search: '',
        filters: { url_key: { eq: params?.urlKey } },
      },
      options: {
        context: {
          headers: {
            Store: getLocalStore(stores, locale as string),
          },
        },
        fetchPolicy: 'network-only',
      },
    });
    const product = data?.products?.items?.[0] || null;

    if (!isValidObject(product) || !product.sku) {
      return {
        notFound: true,
      };
    }

    const pageProps: PageOptions = {
      title: product?.name,
      metaTitle: product?.meta_title || product?.name,
      metaDescription: product?.meta_description,
      metaKeywords: product?.meta_keyword,
      canonical: product?.canonical_url,
    };
    return {
      props: {
        ...(await serverSideTranslations(locale as string, ['common'])),
        product: product || {},
        pageOptions: pageProps,
      },
      revalidate: 30,
    };
  } catch (error) {
    console.error('Product Detail: ', error);
    return {
      notFound: true,
    };
  }
}
