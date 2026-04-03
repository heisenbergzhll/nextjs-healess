import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import UPDATE_CUSTOMER from '@voguish/module-customer/graphql/mutation/UpdateCustomer.graphql';
import GET_CUSTOMER from '@voguish/module-customer/graphql/Customer.graphql';
import { useCustomerMutation } from '@voguish/module-customer/hooks/useCustomerMutation';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import InputField from '@voguish/module-theme/components/ui/Form/Elements/Input';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { FieldValues, useForm } from 'react-hook-form';
import { ButtonMui } from '@packages/module-theme/components/ui/ButtonMui';
import { useState } from 'react';
const ArrowBackIcon = dynamic(() => import('@mui/icons-material/ArrowBack'));

const commonStyles = {
  bgcolor: 'background.paper',
  pb: '5px',
  border: 1,
  borderRadius: 1,
  borderColor: 'themeAdditional.borderColor',
};
type EditFormType = {
  handleClick: Function;
  userinfoData: {
    customer: {
      firstname: string;
      lastname?: string;
      email: string;
    };
  };
};
interface ProfileInputType {
  email: string;
  firstname: string;
  lastname: string;
  password?: string | '';
  is_seller?: boolean;
}
const EditForm = ({ handleClick, userinfoData }: EditFormType) => {
  const [updateCustomer, { loading }] = useCustomerMutation(UPDATE_CUSTOMER);
  const { t } = useTranslation('common');
  const [originalEmail] = useState(userinfoData?.customer?.email);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProfileInputType>({ defaultValues: userinfoData?.customer });
  
  const currentEmail = watch('email');
  const isEmailChanged = currentEmail !== originalEmail;
  
  const { showToast } = useToast();

  const profileUpdate = (data: FieldValues) => {
    const validFormdata = {
      firstname: `${data.firstname || ''}`,
      lastname: `${data.lastname || ''}`,
      email: `${data.email || ''}`,
      password: `${data.password || ''}`,
      is_seller: data.is_seller == 0 ? false : true || false,
      profileurl: data.profileurl ? data.profileurl : '',
    };
    updateCustomer({
      variables: {
        input: validFormdata,
      },
      refetchQueries: [{ query: GET_CUSTOMER }],
      awaitRefetchQueries: true,
    })
      .then((response) => {
        if (response.data?.updateCustomer) {
          showToast({
            type: 'success',
            message: t('Profile updated successfully!'),
          });
          handleClick(false);
        } else {
          setError('password', {
            message: t('The current password is invalid!'),
          });
        }
      })
      .catch((err) => {
        const errorMessage = err?.message || err?.graphQLErrors?.[0]?.message || '';
        
        if (errorMessage.includes('Invalid login or password')) {
          setError('password', {
            message: t('The current password is invalid!'),
          });
        } else {
          showToast({
            type: 'error',
            message: errorMessage || t('An error occurred'),
          });
        }
      });
  };

  return (
    <Box
      className="w-full"
      component="form"
      onSubmit={handleSubmit(profileUpdate)}
    >
      <Grid className="w-full" sx={{ ...commonStyles }}>
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1,
            borderBottom: '1px solid',
            borderColor: 'themeAdditional.borderColor',
          }}
        >
          <ArrowBackIcon
            onClick={() => handleClick(false)}
            className="cursor-pointer hover:text-brand rtl:rotate-180"
            sx={{
              fontSize: 25,
            }}
          />

          <Typography variant="h4" sx={{ mx: 1, flexGrow: 1 }} component="div">
            {' '}
            {t('Edit Profile')}
          </Typography>
          <ButtonMui
            className="rounded-none shadow-none bg-brand"
            variant="contained"
            type="submit"
            isLoading={loading}
          >
            <span className="hidden sm:block">{t('Save Changes')}</span>
            <span className="block sm:hidden">{t('Submit')}</span>
          </ButtonMui>
        </Grid>

        <Grid sx={{ p: 2 }} className="min-w-full" spacing={2}>
          <Grid sm={6} xs={12} item>
            <label htmlFor="firstname">{t('First Name')}</label>
            <InputField
              className="mt-0 mb-1"
              type="text"
              placeHolder={t('First Name')}
              error={!!errors?.firstname?.message}
              helperText={errors?.firstname?.message || ''}
              {...register('firstname', {
                required: t('* First Name is required'),
              })}
            />
          </Grid>
          <Grid sm={6} xs={12} item>
            <label htmlFor="lastname">{t('Last Name')}</label>
            <InputField
              className="mt-0 mb-1"
              type="text"
              placeHolder={t('Last Name')}
              error={!!errors?.lastname?.message}
              helperText={errors?.lastname?.message || ''}
              {...register('lastname', {
                required: t('* lastname is required'),
              })}
            />
            <input type="hidden" {...register('is_seller')} defaultValue={0} />
          </Grid>
          <Grid sm={6} xs={12} item>
            <label htmlFor="email">{t('Email')}</label>
            <InputField
              className="mt-0 mb-1"
              type="text"
              placeHolder={t('Email')}
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
          <Grid item sm={6} xs={12}>
            <label htmlFor="password">{t('Password')}</label>
            <InputField
              className="mt-0 mb-1"
              placeHolder={t('Password')}
              type="password"
              error={!!errors?.password?.message}
              helperText={errors?.password?.message || ''}
              {...register('password', {
                required: isEmailChanged ? t('* Password is required') : false,
                pattern: isEmailChanged ? {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/,
                  message: t('Please enter a valid Password'),
                } : undefined,
              })}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
export default EditForm;
