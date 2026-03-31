import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getFormattedPrice } from '@utils/Helper';
import { usePlaceOrder } from '@voguish/module-quote/hooks';
import { CheckoutStepReview } from '@voguish/module-quote/types';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { ButtonMui } from '@voguish/module-theme/components/ui/ButtonMui';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import FormWrapper from './FormWrapper';
const AddressCard = dynamic(() => import('./Address/AddressCard'));
const ArrowBack = dynamic(() => import('@mui/icons-material/ArrowBack'));

const ReviewOrder = ({
  selectedShippingMethod,
  selectedShippingAddress,
  selectedPaymentMethod,
  cartId,
  selectedBillingAddress,
  isVirtual,
  handlePrev,
}: CheckoutStepReview) => {
  const { placeOrderHandler, isInProcess } = usePlaceOrder();
  /**
   * Place order
   */
  const placeOrder = async () => {
    await placeOrderHandler(cartId);
  };
  const { t } = useTranslation('common');

  return (
    <ErrorBoundary>
      <FormWrapper className="lg:ml-0.5 xl:ml-1">
        <Grid className="grid gap-7 md:grid-cols-2">
          {!isVirtual ? (
            <span>
              <Typography
                sx={{ fontSize: 16, fontWeight: 500, mb: 0.5 }}
                variant="subtitle1"
              >
                {t('Delivery address')}
              </Typography>
              <AddressCard address={selectedShippingAddress} />
            </span>
          ) : (
            <span>
              <Typography
                sx={{ fontSize: 16, fontWeight: 500, mb: 0.5 }}
                variant="subtitle1"
              >
                {t('Billing address')}
              </Typography>
              <AddressCard address={selectedBillingAddress} />
            </span>
          )}
          <span>
            {!isVirtual && (
              <ErrorBoundary>
                <Typography
                  sx={{ fontSize: 16, fontWeight: 500, mb: 0.5 }}
                  variant="subtitle1"
                >
                  {t('Shipping Mode')}
                </Typography>
                <Grid
                  className="rounded-md"
                  sx={{ backgroundColor: '#F3F3F3' }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontSize: 16, fontWeight: 500 }}
                      color="text.main"
                    >
                      {`${
                        selectedShippingMethod?.carrier_title
                      }-${getFormattedPrice(
                        selectedShippingMethod?.amount.value,
                        selectedShippingMethod?.amount.currency
                      )} `}
                    </Typography>
                  </CardContent>
                </Grid>
              </ErrorBoundary>
            )}
            <Typography
              sx={{ fontSize: 16, fontWeight: 500, mt: 2, mb: 0.5 }}
              variant="subtitle1"
            >
              {t('Payment Mode')}
            </Typography>
            <Grid className="rounded-md" sx={{ backgroundColor: '#F3F3F3' }}>
              <CardContent>
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: 16, fontWeight: 500 }}
                  color="text.main"
                >
                  {`${selectedPaymentMethod?.title}`}
                </Typography>
              </CardContent>
            </Grid>
          </span>
        </Grid>
      </FormWrapper>
      <Grid className="flex items-center justify-between w-full py-5">
        <Button
          onClick={handlePrev}
          className="flex space-x-3 rounded-none px-2 py-0.5 font-normal tracking-widest shadow-none"
          sx={{ color: '#2C3145', minWidth: 0 }}
        >
          <ArrowBack className="text-lg rounded-full rtl:rotate-180 sm:text-xl" />
          <span>{t('Go to Payment')}</span>
        </Button>

        <ButtonMui
          isLoading={isInProcess || false}
          className="rounded-none shadow-none md:w-1/3"
          variant="contained"
          onClick={placeOrder}
        >
          {t('Place Order')}
        </ButtonMui>
      </Grid>
    </ErrorBoundary>
  );
};
export default ReviewOrder;
