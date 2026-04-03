import Button from '@mui/material/Button';
import Typography from '@mui/material/Stack';
import { PLACEHOLDER_IMG } from '@utils/Constants';
import { useCustomerMutation } from '@voguish/module-customer/hooks/useCustomerMutation';
import { useCustomerQuery } from '@voguish/module-customer/hooks/useCustomerQuery';
import Customer from '@voguish/module-customer/graphql/Customer.graphql';
import Become_Seller from '@voguish/module-marketplace/graphql/mutation/BecomeASeller.graphql';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { HTMLRenderer } from '@voguish/module-theme/components/HTMLRenderer';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import { ButtonMui } from '@voguish/module-theme/components/ui/ButtonMui';
import InputField from '@voguish/module-theme/components/ui/Form/Elements/Input';
import DialogModal from '@voguish/module-theme/components/widgets/Modals/DialogModal';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
const SellerPageBanner = (props: any) => {
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common');

  const { bannerData } = props;
  const content = bannerData?.banner?.[0]?.['content'];
  const bannerImage = bannerData?.banner?.[0]?.['image'];
  const { status } = useSession();
  
  const { data: customerData, refetch: refetchCustomer } = useCustomerQuery(Customer, {
    skip: status !== 'authenticated',
    fetchPolicy: 'network-only',
  });

  const becomeASeller = () => {
    if (status === 'authenticated') {
      if (customerData?.customer?.is_seller) {
        router.push('/customer/account');
      } else {
        setIsOpen(true);
      }
    } else {
      router.push('/customer/account/create');
    }
  };
  const [sellerBecomePartner, { loading }] = useCustomerMutation(Become_Seller);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const handleClose = () => {
    setIsOpen(false);
    reset();
  };
  const { showToast } = useToast();

  const registerSeller = (data: FieldValues) => {
    sellerBecomePartner({
      variables: {
        shopUrl: data.shopUrl,
        isSeller: data.isSeller,
      },
    })
      .then((res) => {
        if (res?.data?.sellerBecomePartner?.message) {
          showToast({
            message: res?.data?.sellerBecomePartner?.message,
            type: 'success',
          });
          handleClose();
          refetchCustomer();
        }
      })
      .catch((error) => {
        showToast({
          message: `${error?.message || JSON.stringify(error)}`,
          type: 'error',
        });
      });
  };
  return (
    <ErrorBoundary>
      <div
        className="relative !bg-cover !bg-center !bg-no-repeat bg-blend-darken"
        style={{
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          background: `url(${
            bannerImage != null ? bannerImage : PLACEHOLDER_IMG
          })`,
        }}
      >
        {' '}
        <div className="h-full bg-[rgba(8,_28,_60,_0.56)] py-[2.81rem]">
          <div className="max-w-3xl px-6 mx-auto text-center text-white md:px-12">
            {props.theme == true && (
              <Typography
                component="h1"
                fontWeight="fontWeightBold"
                textTransform="capitalize"
                className="my-0 mb-3.5 leading-[3.75rem] md:mb-7"
                fontSize={{ xs: 24, sm: 29, md: 39, lg: 50 }}
              >
                <HTMLRenderer
                  htmlText={bannerData?.layoutOne?.marketplacelabel1}
                ></HTMLRenderer>
              </Typography>
            )}
            {props.theme == true ? (
              <Typography className="my-0 break-normal" component="div">
                <HTMLRenderer htmlText={content}></HTMLRenderer>
              </Typography>
            ) : (
              <Typography
                className="!m-0 break-normal leading-5"
                component="div"
                fontSize={{ xs: 12, sm: 14, md: 15, lg: 16 }}
              >
                <HTMLRenderer
                  className="[&>p]:!text-[0.75rem] [&>p]:sm:!text-[0.875rem] [&>p]:md:!text-[0.9375rem] [&>p]:lg:!text-[1rem]"
                  htmlText={content}
                ></HTMLRenderer>
              </Typography>
            )}
            {bannerData?.banner?.[0]?.['label'] && (
              <Button
                color="primary"
                variant="contained"
                type="submit"
                className="py-3 mt-3 text-base font-semibold leading-normal rounded-none px-7"
                onClick={becomeASeller}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: bannerData?.banner?.[0]?.['label'],
                  }}
                ></span>
              </Button>
            )}
          </div>
        </div>
      </div>
      <DialogModal
        isOpen={isOpen}
        handClose={handleClose}
        title="Become A Seller"
        titleClass="my-0 pb-6 text-center text-xl font-semibold md:text-2xl"
      >
        <form className="grid gap-4" onSubmit={handleSubmit(registerSeller)}>
          <InputField
            type="text"
            label={t('Shop Url')}
            placeHolder={t('Shop Url')}
            className="Customized placeholder:text-CheckoutPlaceHolder"
            error={!!errors?.shopUrl?.message}
            helperText={errors?.shopUrl?.message || ''}
            {...register('shopUrl', {
              required: t('* Enter Shop URL'),
            })}
          />
          <input {...register('isSeller')} value={1} type="hidden" />
          <div className="flex items-center justify-end w-full gap-4">
            <Button
              className="rounded-[unset] border border-solid border-darkGreyBackground px-4 text-darkGreyBackground hover:border-darkBackground hover:bg-darkBackground hover:text-white md:px-8"
              variant="outlined"
              onClick={handleClose}
            >
              {t('Cancel')}
            </Button>

            <ButtonMui
              isLoading={loading || false}
              type="submit"
              className="rounded-[unset] text-center"
              variant="contained"
            >
              {t('Continue As Seller')}
            </ButtonMui>
          </div>
        </form>
      </DialogModal>
    </ErrorBoundary>
  );
};
export default SellerPageBanner;
