import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getFormattedDate, getFormattedPrice } from '@utils/Helper';

import { NoOrderProduct } from '@voguish/module-customer/Components/OrderTab/NoOrderProduct';
import { OrderPlaceHolder } from '@voguish/module-customer/Components/OrderTab/OrderPlaceHolder';
import { useCustomerQuery } from '@voguish/module-customer/hooks/useCustomerQuery';

import GET_ORDER from '@voguish/module-customer/graphql/CustomerOrderProduct.graphql';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import Sidebar from '../Layout/Sidebar';
const ReOrderItem = dynamic(() => import('./ReOrderItem'));
const Pagination = dynamic(() => import('./Pagination'));

const style = {
  borderRadius: 1,
};

const placeHolders = new Array(3).fill(0);

type payloadActionType = {
  payload: number;
};
interface CustomerItemDataType {
  number: string;
  order_date: string;
  status: string;
  total: FormatPriceDataType;
}
/**
 * Price format DataType
 */
interface FormatPriceDataType {
  grand_total: {
    value: number;
    currency: string;
  };
}
/**
 * Get Price format
 */
function getFormattedPriceValue(total: FormatPriceDataType) {
  const productPrice = total?.grand_total;
  return getFormattedPrice(productPrice?.value, productPrice?.currency);
}

const OrderProduct = () => {
  const [pageSize, setPageSize] = useState(5);
  const { data, loading /*, error */ } = useCustomerQuery(GET_ORDER, {
    variables: { currentPage: 1, pageSize: pageSize },
  });
  const total_order = data?.customer?.orders?.total_count;
  const orders = data?.customer?.orders.items;
  const managePagination = ({ payload }: payloadActionType) => {
    setPageSize(payload);
  };
  const { t } = useTranslation('common');

  return (
    <Sidebar>
      <Grid container sx={{ ...style }}>
        <Grid
          item
          className="mb-4 rounded-md"
          xs={12}
          sx={{
            p: 2,
            border: 1,
            borderColor: 'themeAdditional.borderColor',
          }}
        >
          <Typography variant="h4" className="font-semibold">
            {t('Order History')}
          </Typography>
        </Grid>

        <Grid item className="grid w-full gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <OrderPlaceHolder placeHolders={placeHolders} />
          ) : orders?.length > 0 ? (
            orders?.map((item: CustomerItemDataType, index: number) => (
              <Grid
                item
                xs={12}
                key={index}
                className="pt-1 rounded-md"
                sx={{
                  borderBottom: 1,
                  border: '1px solid gray',
                  borderColor: 'themeAdditional.borderColor',
                }}
              >
                <Grid sx={{ padding: '2px 20px 0px 12px' }}>
                  <Grid className="flex items-center justify-between">
                    <Grid item xs={8}>
                      <Typography
                        variant="body2"
                        sx={{ px: 1, mt: 1, mb: 2 }}
                        color="black"
                        fontWeight="600"
                        className="flex gap-0.5"
                      >
                        {t('Order No.')} <span> {' #' + item.number}</span>
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid className="flex justify-between">
                    <Grid item sm={9} xs={6} sx={{ px: 1, pb: 1 }}>
                      <Typography variant="body2" display="inline">
                        {getFormattedDate(item.order_date, 'dd/mm/yyyy')}
                      </Typography>
                      <Typography variant="body2" className="mt-2 mb-1">
                        {getFormattedPriceValue(item?.total)}
                      </Typography>
                    </Grid>
                    <Box>
                      <Grid item>
                        <Chip
                          label={item?.status}
                          style={{
                            borderRadius: '5px',
                            backgroundColor: '#EEEEEE',
                          }}
                        />
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
                <Grid
                  sx={{
                    padding: '2px 11px 2px 0px',
                    borderTop: 1,
                    borderColor: 'themeAdditional.borderColor',
                  }}
                >
                  <Grid className="absolute right-2 top-4" item sm={3} xs={6}>
                    <Box
                      component="div"
                      display="flex"
                      justifyContent={{ xs: 'end' }}
                    >
                      <Chip
                        className="capitalize"
                        label={item.status}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
                  </Grid>
                  <Grid
                    p={1}
                    ml={2}
                    className="flex"
                    item
                    gap={2}
                    justifyContent="flex-end "
                  >
                    <Grid className="my-1 font-normal">
                      <ReOrderItem orderId={item?.number} />
                    </Grid>

                    <Grid>
                      <Button
                        className="my-1 mt-[5px] !h-12 !bg-brand rounded-none shadow-none"
                        size="small"
                        component={Link}
                        variant="contained"
                        href={`/sales/order/${item?.number}`}
                      >
                        {t('View Order')}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ))
          ) : (
            <NoOrderProduct />
          )}
        </Grid>

        <Grid
          className="w-full"
          item
          lg={12}
          sx={{
            borderWidth: '1px',
            borderColor: 'themeAdditional.borderColor',
          }}
        >
          <ErrorBoundary>
            <Pagination
              pageSize={5}
              currentPage={1}
              changeHandler={managePagination}
              loadingState={loading}
              totalCount={total_order || 0}
            />
          </ErrorBoundary>
        </Grid>
      </Grid>
    </Sidebar>
  );
};
export default OrderProduct;
