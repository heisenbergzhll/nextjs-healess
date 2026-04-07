import { useQuery } from '@apollo/client';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { isValidArray, isValidObject } from '@utils/Helper';
import SELLER_LIST_QUERY from '@voguish/module-marketplace/graphql/SellersList.graphql';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Containers from '@voguish/module-theme/components/ui/Container';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { Items } from '../type';
import { Placeholder } from './Placeholder';
const StoreItem = dynamic(() => import('./StoreItem'));
const StoreList = () => {
  const { loading, error, data } = useQuery(SELLER_LIST_QUERY, {
    variables: {
      filter: { is_seller: { eq: '1' } },
    },
    fetchPolicy: 'network-only',
  });
  const { t } = useTranslation('common');

  if (error)
    return (
      <p>
        {t('Error')}! {`${error?.message || JSON.stringify(error)}`}
      </p>
    );

  const placeHolder = new Array(12).fill(0);

  return (
    <Containers>
      {
        <ErrorBoundary>
          <Typography variant="h4" mb={4}>
            {t('All Sellers')}
          </Typography>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 place-content-stretch xl:grid-cols-4 2xl:grid-cols-5 lg:gap-6 xl:gap-8">
            {loading &&
              placeHolder.map((item, index) => (
                <Box key={`${index + item}`} className="">
                  <Grid>
                    <Placeholder />
                  </Grid>
                </Box>
              ))}
            {isValidObject(data) &&
              isValidObject(data?.sellersList) &&
              isValidArray(data?.sellersList?.items) &&
              data?.sellersList?.items.map((store: Items) => (
                <div key={store?.seller_id}>
                  <StoreItem store={store} />
                </div>
              ))}
          </div>
        </ErrorBoundary>
      }
    </Containers>
  );
};
export default StoreList;
