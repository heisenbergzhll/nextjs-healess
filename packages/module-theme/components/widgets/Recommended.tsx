import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CircularProgress from '@mui/material/CircularProgress';
import Rating from '@mui/material/Rating';
import { FEEDS_FRACTION } from '@utils/Constants';
import { graphqlRequest } from '@utils/Fetcher';
import { getFormattedPrice, getLocalStore, isValidArray } from '@utils/Helper';
import Placeholder from '@voguish/module-catalog/Components/Product/Item/Placeholder';
import Thumbnail from '@voguish/module-catalog/Components/Product/Item/Thumbnail';
import CATEGORY_QUERY from '@voguish/module-catalog/graphql/Category.graphql';
import PRODUCTS_QUERY from '@voguish/module-catalog/graphql/Products.graphql';
import STORE_LIST from '@voguish/module-catalog/graphql/StoreList.query.graphql';
import {
  ProductItemInterface,
  ProductsListInterface,
} from '@voguish/module-catalog/types';
import { RecentlyViewedProduct } from '@voguish/module-theme/types/home-page';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ErrorBoundary from '../ErrorBoundary';
import Info from '../elements/Info';
import Containers from '../ui/Container';
import { InfoTextPlaceHolder } from './placeholders/InfoTextPlaceHolder';

function Recommended({
  products: _productsProp,
  homeLoading,
}: {
  products: RecentlyViewedProduct;
  homeLoading: any;
}) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductItemInterface[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState<boolean>(!!homeLoading);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageSize = 10;
  const placeHolders = new Array(5).fill(0);

  const fetchProducts = async (page: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const storListResponse = await graphqlRequest({
        query: STORE_LIST,
        variables: {},
      });
      const stores = storListResponse?.data?.availableStores || [];
      const locale = router.locale || 'en';
      const storeCode = getLocalStore(stores, locale);

      const categoryData = await graphqlRequest({
        query: CATEGORY_QUERY,
        variables: {
          search: '',
          filters: { url_key: { eq: 'makeup' } },
        },
        options: {
          context: {
            headers: {
              Store: storeCode,
            },
          },
          fetchPolicy: 'no-cache',
        },
      });

      const skincareCategory = categoryData?.categoryList?.[0];
      const categoryUid = skincareCategory?.uid;

      if (!categoryUid) {
        setHasMore(false);
        return;
      }

      const productsData: ProductsListInterface = await graphqlRequest({
        query: PRODUCTS_QUERY,
        variables: {
          filters: {
            category_uid: { in: [categoryUid] },
          },
          sort: {
            name: 'ASC',
          },
          search: '',
          pageSize,
          currentPage: page,
        },
        options: {
          context: {
            headers: {
              Store: storeCode,
            },
          },
          fetchPolicy: 'network-only',
        },
      });

      console.log('productsData', productsData)
      const fetchedItems = productsData?.products?.items || [];
      const total = productsData?.products?.total_count || 0;
      const totalPages = Math.ceil(total / pageSize);

      setProducts((prev) => (append ? [...prev, ...fetchedItems] : fetchedItems));
      setCurrentPage(page);
      setHasMore(page < totalPages);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.locale]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchProducts(currentPage + 1, true);
  };

  const isInitialLoading = loading && !isValidArray(products);

  console.log('hasMore', hasMore)
  return (
    <div className="pb-4">
      {isInitialLoading ? (
        <Containers>
          <InfoTextPlaceHolder extraClasses="mx-auto" />
          <span className="pt-4">
            <div className="hidden md:flex">
              {placeHolders.map((item, index) => (
                <div className="w-[20%]" key={`${index + item}`}>
                  <Placeholder />
                </div>
              ))}
            </div>
            <div className="md:hidden">
              <Placeholder />
            </div>
          </span>
        </Containers>
      ) : (
        <ErrorBoundary>
          <div className="2xl:max-w-[90rem] lg:px-[6.625rem] mx-auto">
            <div>
              {isValidArray(products) && (
                <Info className="!mx-2.5" heading="Recommended For You">
                  <span>
                    Discover curated skincare picks tailored for you.
                  </span>
                </Info>
              )}
            </div>
            <div className="pt-4">
              {isValidArray(products) && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {products.map((item) => (
                    <article
                      key={item?.id}
                      className="relative w-full  min-h-full max-w-full h-[24rem] mx-auto duration-300 bg-white cursor-pointer group"
                    >
                      <div className="w-full !overflow-hidden max-w-full">
                        <Link
                          className="block w-full overflow-hidden"
                          href={`/catalog/product/${item?.url_key}`}
                        >
                          <div className="w-full block !overflow-hidden !box-border border border-solid border-[#D2D2D2] rounded-2xl">
                            <Thumbnail
                              alt={item?.name}
                              thumbnail={
                                (item?.thumbnail?.thumbnail_url ??
                                  item?.thumbnail?.url) as string
                              }
                              fill
                              className="object-contain !static  hover:shadow-[0px_4px_24px_0px_rgba(0,_0,_0,_0.11)]   object-center  transition duration-500 cursor-pointer max-h-fit aspect-square md:object-scale-down group-hover:scale-110"
                            />
                          </div>


                        </Link>
                      </div>
                      <div className="flex items-center gap-1 mt-3">
                        <ErrorBoundary>
                          <Rating
                            size="medium"
                            className="text-brand"
                            max={1}
                            defaultValue={
                              item?.rating_summary
                                ? item?.rating_summary / 100
                                : 0
                            }
                            precision={0.1}
                            readOnly
                          />
                        </ErrorBoundary>
                        <p className="my-0 text-sm font-semibold leading-[1.58rem] tracking-[0.0425rem] text-neutral-900">
                          {(
                            (item?.rating_summary || 0) / FEEDS_FRACTION
                          ).toFixed(1)}
                        </p>
                      </div>
                      <div className="flex items-center my-2">
                        <p className="my-0 text-sm font-normal text-black leading-[1.56rem] max-w-[100%] line-clamp-2">
                          {item?.name}
                        </p>
                      </div>
                      <footer className="flex items-start justify-between">
                        <ErrorBoundary>
                          <p className="my-0 text-base font-semibold leading-6 text-black">
                            {getFormattedPrice(
                              item?.price_range?.maximum_price?.final_price
                                ?.value,
                              item?.price_range?.maximum_price?.final_price
                                ?.currency
                            )}
                          </p>
                        </ErrorBoundary>
                      </footer>
                    </article>
                  ))}
                </div>
              )}

              {hasMore && isValidArray(products) && (
                <div className="flex justify-center mt-8">
                  {loadingMore ? (
                    <p className="flex justify-center items-center gap-1">
                      <CircularProgress color="primary" className="text-gray-400" size={18} thickness={5} />
                      <span className="text-gray-400">Loading...</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="px-6 py-3 text-sm flex items-center justify-center gap-2 shadow-md font-semibold text-black bg-white border border-solid rounded-full border-neutral-300 hover:bg-neutral-50 disabled:opacity-60"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      <span>Load More Products</span>
                      <ArrowForwardIcon fontSize="small" />

                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
}

export default Recommended;

