import { client, httpLink, setAuthToken } from '@lib/apollo-client';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ErrorBoundary from '@packages/module-theme/components/ErrorBoundary';
import { setCart } from '@store/cart';
import { useAppDispatch } from '@store/hooks';
import { CART_DATA, STORE_CONFIG, getLocalStorage } from '@store/local-storage';
import { setUser } from '@store/user';
import { AUTHORIZED } from '@utils/Constants';
import { useCustomerMutation } from '@voguish/module-customer/hooks/useCustomerMutation';
import MERGE_CART from '@voguish/module-quote/graphql/mutation/MergeCart.graphql';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import { ButtonMui } from '@voguish/module-theme/components/ui/ButtonMui';
import { CheckBoxInputField } from '@voguish/module-theme/components/ui/Form/Elements';
import InputField from '@voguish/module-theme/components/ui/Form/Elements/Input';
import { Link } from '@voguish/module-theme/components/ui/Link';
import { signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FieldValues, useForm } from 'react-hook-form';

export default function LoginForm() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();
  const [mergeCart] = useCustomerMutation(MERGE_CART);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm();
  const token = session?.user?.token;
  const { query } = router;
  const { showToast } = useToast();
  let storeData = getLocalStorage(STORE_CONFIG, true) || {};

  useEffect(() => {
    let guestId = getLocalStorage(CART_DATA, true) || {};
    if (status === AUTHORIZED) {
      client.setLink(setAuthToken(token || '').concat(httpLink));
      if (!guestId.email && guestId.total_quantity > 0) {
        mergeCart({
          variables: { sourceCartId: guestId.id },
        }).then((res) => {
          const data = res?.data?.mergeCarts;
          dispatch(setUser(session));
          dispatch(setCart({ ...data, isGuest: false }));
          router.push(query?.callbackUrl?.toString() || '/');
        });
      } else {
        dispatch(setUser(session));

        router.push(query?.callbackUrl?.toString() || '/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeCart, token, status]);

  const loginUser = async (data: FieldValues) => {
    const result = await signIn('credentials', {
      redirect: false,
      ...data,
      callbackUrl: '/customer/account',
    });
    if (result?.error) {
      showToast({ type: 'error', message: result.error });
    }
    if (result?.ok) {
      dispatch(setUser(session));
      router.push(
        (query?.callbackUrl?.toString() !== '/customer/account/create' &&
          query?.callbackUrl?.toString()) ||
        '/'
      );
      showToast({
        message: `${storeData.welcome}`,
      });
    }
  };

  useEffect(() => {
    if (session?.user?.token) {
      router.push('/customer/account');
    }
  });

  return (
    <ErrorBoundary>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(loginUser)}
        sx={{ mt: 1, width: '100%' }}
      >
        <Typography variant="h6" className="font-semibold">
          {t('Login')}
        </Typography>
        <FormGroup className="grid gap-2 mt-4">
          <Grid className="grid gap-1">
            <Typography component="label" htmlFor="email">
              {t('Email')}
            </Typography>
            <InputField
              placeHolder={t('Email')}
              type="text"
              error={!!errors?.email?.message}
              helperText={errors?.email?.message || ''}
              {...register('email', {
                required: t('* Email is required'),
                pattern: {
                  value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                  message: t('Please enter a valid email'),
                },
              })}
            />
          </Grid>
          <Grid className="grid gap-1">
            <Typography component="label" htmlFor="password">
              {t('Password')}
            </Typography>

            <InputField
              placeHolder={t('Password')}
              type="password"
              error={!!errors?.password?.message}
              helperText={errors?.password?.message || ''}
              {...register('password', {
                required: t('* Password is required'),
              })}
            />
          </Grid>
          <FormGroup sx={{ mt: -0.7 }}>
            <CheckBoxInputField
              label={t`Remember me`}
              {...register('remember')}
            />
          </FormGroup>
          <FormGroup
            sx={{
              my: 1.5,
              gap: 1,
            }}
            className="flex-row items-center md:justify-between -xs:justify-between"
          >
            <ButtonMui
              isLoading={isSubmitting || false}
              className="px-8 rounded-none bg-darkGreyBackground sm:py-1 md:py-2 lg:py-2"
              color="secondary"
              variant="contained"
              type="submit"
            >
              {t('Log in')}
            </ButtonMui>

            <Link
              underline="none"
              className="duration-300 hover:underline"
              color="primary"
              variant="subtitle1"
              href="/customer/account/forget-password"
            >
              {t('Forgot Password?')}
            </Link>
          </FormGroup>
        </FormGroup>
        <Typography variant="body1" textAlign="center" pt={3}>
          {t('New to Voguish?')}
          <Link
            className="px-1"
            underline="hover"
            color="primary"
            variant="subtitle1"
            href="/customer/account/create"
          >
            {t('Sign Up')}
          </Link>{' '}
          {t('now')}
        </Typography>
      </Box>
    </ErrorBoundary>
  );
}
