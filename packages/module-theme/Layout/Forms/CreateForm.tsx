import { useMutation } from '@apollo/client';
import { client, httpLink, setAuthToken } from '@lib/apollo-client';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { setCart } from '@store/cart';
import { useAppDispatch } from '@store/hooks';
import {
  CART_DATA,
  STORE_CONFIG,
  getKeyFromStorage,
  getLocalStorage,
} from '@store/local-storage';
import { setUser } from '@store/user';
import { IS_SELLER } from '@utils/Constants';
import CREATE_CUSTOMER from '@voguish/module-customer/graphql/mutation/CreateCustomer.graphql';
import { useCustomerMutation } from '@voguish/module-customer/hooks/useCustomerMutation';
import CREATE_SELLER_ACCOUNT from '@voguish/module-marketplace/graphql/mutation/CreateSellerAccount.graphql';
import MERGE_CART from '@voguish/module-quote/graphql/mutation/MergeCart.graphql';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import { ButtonMui } from '@voguish/module-theme/components/ui/ButtonMui';
import {
  CheckBoxInputField,
  RadioInputField,
} from '@voguish/module-theme/components/ui/Form/Elements';
import InputField from '@voguish/module-theme/components/ui/Form/Elements/Input';
import { Link } from '@voguish/module-theme/components/ui/Link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';

export default function CreateForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const router = useRouter();
  const { query } = router;
  const { showToast } = useToast();
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  const [mergeCart] = useCustomerMutation(MERGE_CART);
  const token = session?.user?.token;
  const { t } = useTranslation('common');
  const [isInProcess, setIsInProcess] = useState(false);

  useEffect(() => {
    let guestId = getLocalStorage(CART_DATA, true) || {};
    client.setLink(setAuthToken(token || '').concat(httpLink));
    if (token) {
      if (!guestId.email && guestId.total_quantity > 0) {
        mergeCart({
          variables: { sourceCartId: guestId.id },
        }).then((res) => {
          const data = res?.data?.mergeCarts;
          data && data.id && dispatch(setCart({ ...data, isGuest: false }));
          dispatch(setUser(session));
          showToast({
            message: `${t('Welcome again!')} ${session?.user?.name || ''}`,
          });
          router.push(query?.callbackUrl?.toString() || '/');
        });
      } else {
        dispatch(setUser(session));
        router.push(query?.callbackUrl?.toString() || '/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeCart, token]);

  const [createCustomer] = useMutation(CREATE_CUSTOMER);
  const [createSellerAccount] = useMutation(CREATE_SELLER_ACCOUNT);

  useEffect(() => {
    if (session?.user?.token) {
      router.push('/customer/account');
    }
  }, [session?.user?.token, router]);

  const [isSellerWatch] = watch(['is_seller']);
  useEffect(() => {
    isSellerWatch;
  }, [isSellerWatch]);
  const marketplaceIsActive =
    getKeyFromStorage(STORE_CONFIG, 'marketplace_is_active') || false;

  const registerUser = async (data: FieldValues) => {
    setIsInProcess(true);
    const { password, confirmPassword, is_seller, ...rest } = data;
    if (password !== confirmPassword) {
      setIsInProcess(false);
      showToast({
        message: t('Confirm Password And New Password Are Not Similar'),
        type: 'error',
      });
      return;
    }

    const input: any = {
      ...rest,
      password,
      is_seller: is_seller === IS_SELLER,
    };

    if (!marketplaceIsActive) {
      delete input.is_seller;
    }

    const isSeller = input.is_seller === true;
    const mutation = isSeller ? createSellerAccount : createCustomer;

    try {
      mutation({ variables: { input } })
        .then(() => {
          showToast({
            type: 'success',
            message: isSeller
              ? t('Seller account created successfully')
              : t('Account created successfully'),
          });
          router.push('/customer/account/login');
        })
        .catch((err) => {
          showToast({
            message:
              err?.graphQLErrors?.[0]?.message ||
              err?.networkError?.message ||
              err?.message ||
              (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
            type: 'error',
          });
        });
    } catch (err: any) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    } finally {
      setIsInProcess(false);
    }
  };

  const show = {
    opacity: 1,
    display: 'block',
  };

  const hide = {
    opacity: 0,
    transitionEnd: {
      display: 'none',
    },
  };
  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(registerUser)}
      sx={{ mt: 1, width: '100%' }}
    >
      <Typography variant="h6" className="font-semibold">
        {t('Create New Customer Account')}
      </Typography>
      <FormGroup className="grid gap-1 mt-6">
        <Grid className="grid gap-1">
          <Typography component="label" htmlFor="firstname">
            {t('First Name')}
          </Typography>
          <InputField
            placeHolder={t('First Name')}
            type="text"
            error={errors?.firstname?.message ? true : false}
            helperText={errors?.firstname ? errors?.firstname?.message : ''}
            {...register('firstname', {
              required: t('* Firstname is required'),
            })}
          />
        </Grid>
        <Grid className="grid gap-1">
          <Typography component="label" htmlFor="lastname">
            {' '}
            {t('Last Name')}
          </Typography>
          <InputField
            placeHolder={t('Last Name')}
            type="text"
            {...register('lastname', {
              required: t('* Lastname is required'),
            })}
          />
        </Grid>
        <Grid className="grid gap-1">
          <Typography component="label" htmlFor="email">
            {t('Email')}
          </Typography>
          <InputField
            placeHolder={t('Email')}
            type="email"
            error={errors?.email?.message ? true : false}
            helperText={errors?.email ? errors?.email?.message : ''}
            {...register('email', {
              required: t('* Email is required'),
              pattern: {
                value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                message: t('Please enter a valid email'),
              },
            })}
          />
        </Grid>
        <FormGroup
          sx={{
            rowGap: 1.6,
          }}
        >
          <CheckBoxInputField
            label={t('Sign Up For Newsletter')}
            {...register('is_subscribed')}
          />

          <CheckBoxInputField
            disabled={true}
            label={t('Allow remote shopping assistance')}
            //not able to unregister so commented for later use
            // {...(unregister('allow_remote'), { keepValue: true })}
          />
        </FormGroup>
        {marketplaceIsActive && (
          <Grid>
            <Grid className="mb-1 mt-2.5">
              <RadioInputField
                label={t('Do you wand to become a seller/vendor ?')}
                defaultValue="no"
                id="become-seller"
                row
                {...register('is_seller')}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
              />
            </Grid>
            <motion.div
              className="box"
              animate={String(isSellerWatch) === 'yes' ? show : hide}
            >
              {String(isSellerWatch) === 'yes' && (
                <Grid className="-mb-1 mt-2.5">
                  <InputField
                    label={t('Shop URL')}
                    type="text"
                    error={errors?.shop_url?.message ? true : false}
                    helperText={
                      errors?.shop_url ? errors?.shop_url?.message : ''
                    }
                    {...register('profileurl', {
                      required: t('* This is Required field'),
                    })}
                  />
                </Grid>
              )}
            </motion.div>
          </Grid>
        )}

        <Grid className="grid gap-1">
          <Typography component="label" htmlFor="password">
            {t('Password')}
          </Typography>
          <InputField
            placeHolder={t('Password')}
            type="password"
            error={errors?.password?.message ? true : false}
            helperText={errors?.password ? errors?.password?.message : ''}
            {...register('password', {
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/,
                message: t('Please enter a valid Password'),
              },

              required: t(' Password is required'),
            })}
          />
        </Grid>
        <Grid className="grid gap-1">
          <Typography component="label" htmlFor="confirmPassword">
            {t('Confirm Password')}
          </Typography>
          <InputField
            placeHolder={t('Confirm Password')}
            type="password"
            error={errors?.confirmPassword?.message ? true : false}
            helperText={
              errors?.confirmPassword ? errors?.confirmPassword?.message : ''
            }
            {...register('confirmPassword', {
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/,
                message: t('Please enter a valid Password'),
              },

              required: t('* Confirm password is required.'),
            })}
          />
        </Grid>
        <FormGroup
          sx={{
            py: 1.5,
            flexDirection: 'row',
            justifyContent: { xs: 'center', md: 'space-between' },
            alignItems: 'center',
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'themeAdditional.borderColor',
          }}
        >
          <ButtonMui
            isLoading={isInProcess || isSubmitting || false}
            className="px-8 rounded-none bg-darkGreyBackground sm:py-1 md:py-2 lg:py-2"
            color="secondary"
            variant="contained"
            type="submit"
          >
            {t('Create an account')}
          </ButtonMui>
        </FormGroup>
      </FormGroup>
      <Typography variant="body1" textAlign="center" pt={3}>
        {' '}
        {t('Already have an account')}
        <Link
          className="px-1"
          color="primary"
          underline="hover"
          variant="subtitle1"
          href="/customer/account/login"
        >
          {t('Sign In')}
        </Link>
        {t('now')}
      </Typography>
    </Box>
  );
}
