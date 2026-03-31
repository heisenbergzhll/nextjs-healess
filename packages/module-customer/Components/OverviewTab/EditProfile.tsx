import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ButtonMui } from '@packages/module-theme/components/ui/ButtonMui';
import UPDATE_CUSTOMER from '@voguish/module-customer/graphql/mutation/UpdateCustomer.graphql';
import GET_CUSTOMER from '@voguish/module-customer/graphql/Customer.graphql'; 
import { useCustomerMutation } from '@voguish/module-customer/hooks/useCustomerMutation';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import InputField from '@voguish/module-theme/components/ui/Form/Elements/Input';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { FieldValues, useForm } from 'react-hook-form';
import { useState } from 'react';
const ArrowBackIcon = dynamic(() => import('@mui/icons-material/ArrowBack'));
interface Props {
  formData: OverviewInputType;
  handleClick: Function;
}
/**
 * Set Datatyepe for Default form values
 */
interface OverviewInputType {
  email: string;
  firstname: string;
  lastname: string;
  password?: string | '';
}
const commonStyles = {
  bgcolor: 'background.paper',
  // my: 1.5,
  // ml: { md: '8px', xl: '8px', lg: '8px', xs: 0, sm: 0 },
  border: 1,
  borderColor: 'themeAdditional.borderColor',
  borderRadius: 1,
};

const iconStyle = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  mt: 1,
};

function EditProfile({ formData, handleClick }: Props) {
  const { t } = useTranslation('common');
  const [originalEmail] = useState(formData.email);

  const [updateCustomer, { loading }] = useCustomerMutation(UPDATE_CUSTOMER);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<OverviewInputType>({ defaultValues: formData });
  
  const currentEmail = watch('email');
  const isEmailChanged = currentEmail !== originalEmail;
  
  /**
   * Code for set the input value in edit form
   */
  const { showToast } = useToast();

  const editProfile = (data: FieldValues) => {
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
          handleClick();
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
    <ErrorBoundary>
      <Grid
        container
        sx={{ ...commonStyles }}
        justifyContent="space-between"
        component="form"
        onSubmit={handleSubmit(editProfile)}
      >
        <Grid item sm={6} xs={7} sx={{ p: 1 }}>
          <Box component="div" sx={iconStyle}>
            <ArrowBackIcon
              className="rtl:rotate-180 hover:text-brand cursor-pointer"
              onClick={() => handleClick()}
              sx={{
                fontSize: 25,
              }}
            />
            <Typography
              className="hidden font-semibold sm:block"
              variant="h4"
              sx={{ mx: 1 }}
            >
              {t('Edit Profile')}
            </Typography>
            <Typography
              className="block font-semibold sm:hidden"
              variant="h4"
              sx={{ mx: 1 }}
            >
              {t('Edit')}
            </Typography>
          </Box>
        </Grid>

        <Grid item sm={6} xs={5} textAlign="end" sx={{ p: 1 }}>
          <ButtonMui
            className="rounded-[unset] bg-brand"
            variant="contained"
            type="submit"
            isLoading={loading}
          >
            <span className="hidden sm:block">{t('Save Changes')}</span>
            <span className="block sm:hidden">{t('Submit')}</span>
          </ButtonMui>
        </Grid>
        <ErrorBoundary>
          <Box
            className="w-full"
            sx={{
              borderTop: 1,
              borderColor: 'themeAdditional.borderColor',
            }}
          >
            <FormGroup className="w-full px-5 mt-8 mb-5">
              <Grid
                container
                className="grid w-full gap-x-4 md:grid-cols-2"
                spacing={1}
              >
                <div className="w-full">
                  <label htmlFor="firstname">{t('First Name')}</label>
                  <InputField
                    className="mt-0 mb-1"
                    type="text"
                    placeHolder={t('First Name')}
                    error={!!errors?.firstname?.message}
                    helperText={errors?.firstname?.message || ''}
                    {...register('firstname', {
                      required: t('* firstname is required'),
                    })}
                  />
                </div>
                <div className="w-full">
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
                </div>
                <div className="w-full">
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
                </div>
                <div className="w-full">
                  <label htmlFor="password">{t('Password')}</label>
                  <InputField
                    className="mt-0 mb-1"
                    type="password"
                    placeHolder={t('Password')}
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
                </div>
              </Grid>
            </FormGroup>
          </Box>
        </ErrorBoundary>
      </Grid>
    </ErrorBoundary>
  );
}
export default EditProfile;
