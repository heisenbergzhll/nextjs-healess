import { useQuery } from '@apollo/client';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { isValidArray } from '@utils/Helper';

import RATINGS_QUERY from '@voguish/module-catalog/graphql/ProductRatings.graphql';
import REVIEWS_QUERY from '@voguish/module-catalog/graphql/ProductReviews.graphql';
import {
  ProductItemInterface,
  ProductReviewRatingsMetadata,
  ReviewBreakdown,
} from '@voguish/module-catalog/types';
import ErrorBoundary from '../../ErrorBoundary';
import FormSection from './FormSection';
import ReviewIndexPlaceHolder from './ReviewPlaceholder';
import ReviewProgress from './ReviewProgress';
import ReviewsList from './ReviewsList';
export const Review = ({ product }: { product: ProductItemInterface }) => {
  const { sku, name, url_key } = product;

  const { data: ratingsData, loading: ratingsLoading } =
    useQuery<ProductReviewRatingsMetadata>(RATINGS_QUERY);
  const ratingsFields = ratingsData?.productReviewRatingsMetadata?.items || [];

  const { data: reviewsData, loading: reviewsLoading } = useQuery(REVIEWS_QUERY, {
    variables: { filters: { url_key: { eq: url_key } } },
    fetchPolicy: 'cache-and-network',
  });

  const productData = reviewsData?.products?.items?.[0] || product;
  const rating_summary = productData.rating_summary || 0;
  const review_count = productData.review_count || 0;
  const reviewItems = productData.reviews?.items || [];

  const loading = ratingsLoading || reviewsLoading;

  // Initialize an object with empty arrays for the desired keys
  const filteredReviews: ReviewBreakdown = {
    __5: 0,
    __4: 0,
    __3: 0,
    __2: 0,
    __1: 0,
  };

  if (reviewItems && isValidArray(reviewItems)) {
    reviewItems.forEach(({ ratings_breakdown }: any) => {
      if (isValidArray(ratings_breakdown)) {
        ratings_breakdown.forEach(({ value }: any) => {
          filteredReviews[`__${value}`]++;
        });
      }
    });
  }
  return (
    <ErrorBoundary>
      {loading ? (
        <ReviewIndexPlaceHolder />
      ) : (
        <Grid
          className="max-w-[98vw] flex ltr:md:flex-row flex-col-reverse rtl:md:flex-row-reverse -md:justify-center"
          container
          rowGap={3}
        >
          <ReviewsList reviews={reviewItems} />
          <Grid
            justifyContent="center"
            item
            pl={{ xs: '0rem', md: '2rem', lg: '4rem' }}
            borderLeft={{ xs: 'none', md: 1 }}
            borderColor={{ xs: 'none', md: 'divider' }}
            xs={12}
            md={5.5}
            lg={4.5}
          >
            <Stack pb={{ xs: '1rem', md: '2rem' }}>
              <Typography
                variant="OverallRating"
                className="leading-normal lg:leading-[1.25rem] tracking-wider"
              >
                Overall Rating
              </Typography>
            </Stack>
            <FormSection
              productName={name}
              ratingsFields={ratingsFields}
              reviewCount={review_count}
              sku={sku}
              reviewSummary={rating_summary}
            />

            <ReviewProgress
              filteredReviews={filteredReviews}
              totalRating={review_count}
            />
          </Grid>
        </Grid>
      )}
    </ErrorBoundary>
  );
};

export default Review;
