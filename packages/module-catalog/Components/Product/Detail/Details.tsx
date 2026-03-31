import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import SocialShare from '@packages/module-common/ShareLink';
import { useAppSelector } from '@store/hooks';
import { STORE_CONFIG, getKeyFromStorage } from '@store/local-storage';
import { AUTHORIZED, FEEDS_FRACTION } from '@utils/Constants';
import { getSharePathUrl } from '@utils/Helper';
import { DetailProp } from '@voguish/module-catalog/types';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { HTMLRenderer } from '@voguish/module-theme/components/HTMLRenderer';
import { decode } from 'base-64';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Price from '../Item/Price';
import SellerCard from './SellerCard';
import { useQuery } from '@apollo/client';
import RATINGS_QUERY from '@voguish/module-catalog/graphql/ProductRatings.graphql';
import { ProductReviewRatingsMetadata } from '@voguish/module-catalog/types';

const Rating = dynamic(() => import('@mui/material/Rating'), {
  loading: () => (
    <div className="w-3 h-3 mr-1 bg-gray-200 rounded-sm animate-pulse" />
  ),
  ssr: false,
});
const SimpleProductOption = dynamic(() => import('./SimpleProductOption'), {
  loading: () => (
    <div className="grid gap-2 py-4">
      <div className="w-10 h-1 rounded-md animate-pulse bg-neutral-200" />
      <div className="grid w-full gap-6 my-0 list-none -mx-9 md:grid-cols-2">
        <div className="w-full rounded-md h-14 animate-pulse bg-neutral-300" />
        <div className="w-full rounded-md h-14 animate-pulse bg-neutral-300" />
        <div className="w-full rounded-md h-14 animate-pulse bg-neutral-300" />
      </div>
    </div>
  ),
});

const AddToCompare = dynamic(
  () => import('@voguish/module-compare/Components/AddToCompare'),
  {
    loading: () => (
      <div className="w-full h-10 rounded-md animate-pulse bg-neutral-300" />
    ),
  }
);
const AddToCart = dynamic(() => import('./AddToCart'), {
  loading: () => (
    <div className="flex flex-col gap-4">
      <div className="w-full rounded-md h-14 animate-pulse bg-neutral-300" />
      <div className="w-full rounded-md h-14 animate-pulse bg-neutral-300" />
      <div className="w-full rounded-md h-14 animate-pulse bg-neutral-300" />
    </div>
  ),
});
const ProductReviewForm = dynamic(
  () => import('@voguish/module-theme/components/widgets/ProductReview/ProductReviewForm').then(mod => mod.ProductReviewForm),
  { ssr: false }
);
export function Details(props: DetailProp) {
  const { product, quickView = false } = props;
  const router = useRouter();
  const shareUrl = getSharePathUrl(router?.asPath);
  const rating_summary = product?.rating_summary;
  const { status } = useSession();
  const marketplaceIsActive =
    getKeyFromStorage(STORE_CONFIG, 'marketplace_is_active') || false;
  let currentProduct = useAppSelector(
    (state) => state?.storeConfig?.setProduct
  );
  type CustomOption = {
    id: number;
    value_string: string;
  };

  const [customOptions, setCustomOptions] = useState<CustomOption[]>([]);
  useEffect(() => {
    setCustomOptions([]);
  }, [product?.id]);
  const customValue = (optionId: number, valueString: string) => {
    if (optionId && valueString) {
      setCustomOptions((prevOptions) => {
        return [
          ...prevOptions.filter((opt) => opt.id !== optionId),
          { id: optionId, value_string: valueString },
        ];
      });
    }
  };

  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  const { data } = useQuery<ProductReviewRatingsMetadata>(RATINGS_QUERY);
  const ratingsFields = data?.productReviewRatingsMetadata?.items || [];

  const openForm = () => {
    if (status === AUTHORIZED) {
      setOpen(!open);
    } else {
      router.push('/customer/account/login');
    }
  };
  return (
    <>
      <div className="flex flex-col max-w-full gap-2 lg:col-span-6 -lg:w-full">
        <ErrorBoundary>
          <div className="flex flex-col gap-2">
            <Typography component="h1" variant="ProfileName">
              <HTMLRenderer
                htmlText={product?.name || ''}
                className="leading-normal break-words lg:leading-[1.5rem]"
              ></HTMLRenderer>
            </Typography>
            <Typography
              variant="filter"
              className="pb-2 leading-normal text-hoverEffect break-words lg:leading-[1.25rem]"
              dangerouslySetInnerHTML={{
                __html: product?.short_description?.html,
              }}
            ></Typography>
          </div>
        </ErrorBoundary>
        {product?.__typename !== 'BundleProduct' ? (
          <ErrorBoundary>
            <Price
              className="text-price font-normal leading-normal lg:leading-[2.125rem]"
              minimumPrice={currentProduct?.product?.price_range?.minimum_price}
            />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <div className="flex flex-wrap items-center gap-3 capitalize">
              {t('From')}{' '}
              <Price
                className="text-price font-normal leading-normal lg:leading-[2.125rem]"
                minimumPrice={
                  currentProduct?.product?.price_range?.minimum_price
                }
              />{' '}
              {t('to')}{' '}
              <Price
                className="text-price font-normal leading-normal lg:leading-[2.125rem]"
                minimumPrice={
                  currentProduct?.product?.price_range?.maximum_price
                }
              />{' '}
              <Typography className="lg:pl2.5 whitespace-nowrap pl-0 text-sm !capitalize text-brand md:pl-2.5 md:text-base lg:text-base xl:pl-2.5">
                {product?.stock_status?.replace(/[^a-z0-9]/gi, ' ')}
              </Typography>
            </div>
          </ErrorBoundary>
        )}
        <Grid
          display="flex"
          justifyContent="space-between"
          className="pt-2"
          alignItems="start"
        >
          <Grid className="flex items-center">
            <Grid className="flex items-center rtl:flex-row-reverse">
              <ErrorBoundary>
                <Rating
                  size="small"
                  className="text-brand"
                  max={1}
                  value={rating_summary ? rating_summary / 100 : 0}
                  precision={0.1}
                  readOnly
                />
              </ErrorBoundary>
              <Typography
                variant="filter"
                className="pt-0.5 leading-normal lg:leading-[1.25rem]"
              >
                {((rating_summary ?? 0) || 0) /
                  Number(FEEDS_FRACTION.toFixed(1))}
              </Typography>
              <p
                className="px-1 text-sm text-blue-600 cursor-pointer"
                onClick={openForm}
              >
                {t('Write a review')}
              </p>
            </Grid>
          </Grid>
          {currentProduct?.product?.sku && (
            <Typography
              style={{ lineBreak: 'anywhere' }}
              variant="body1"
              className="hidden uppercase lg:flex md:flex overflow-ellipsis"
              title={currentProduct?.product?.sku ?? ''}
            >
              {t('Sku')} :{currentProduct?.product?.sku}
            </Typography>
          )}
        </Grid>
        {currentProduct?.product?.sku && (
          <Typography
            style={{ lineBreak: 'anywhere' }}
            variant="body1"
            className="block my-1 uppercase lg:hidden md:hidden overflow-ellipsis"
            title={currentProduct?.product?.sku ?? ''}
          >
            {t('Sku')} :{currentProduct?.product?.sku}
          </Typography>
        )}

        {product?.__typename === 'SimpleProduct' && (
          <ErrorBoundary>
            <SimpleProductOption
              customOptions={customOptions}
              customValue={customValue}
              sku={product?.sku}
            />
          </ErrorBoundary>
        )}

        <div className="flex flex-col w-full gap-7 ">
          {product?.__typename !== 'BundleProduct' ? (
            <ErrorBoundary>
              <AddToCart
                sku={currentProduct?.product?.sku}
                optionValue={customOptions}
                product={product}
              />
            </ErrorBoundary>
          ) : (
            <Link className="no-underline" href="#bundle_options">
              <Button
                color="secondary"
                variant="contained"
                className="mx-auto mt-14 w-full rounded-none py-3.5 shadow-none"
                type="submit"
              >
                {' '}
                {t('Customize and Add to Cart')}
              </Button>
            </Link>
          )}

          <ErrorBoundary>
            <div className="m-auto -mt-3">
              <AddToCompare
                productId={product?.uid && parseInt(decode(`${product?.uid}`))}
                productSku={product?.sku && product?.sku}
              />
            </div>
            {shareUrl && (
              <div className="m-auto -mt-3.5">
                <SocialShare link={shareUrl} />
              </div>
            )}
          </ErrorBoundary>
        </div>
        {!quickView && marketplaceIsActive && (
          <ErrorBoundary>
            <SellerCard productId={currentProduct?.product?.sku} />
          </ErrorBoundary>
        )}
      </div>
      <ProductReviewForm
        ratingsFields={ratingsFields}
        sku={product?.sku}
        productName={product?.name}
        openForm={openForm}
        open={open}
      />
    </>
  );
}
export default Details;
