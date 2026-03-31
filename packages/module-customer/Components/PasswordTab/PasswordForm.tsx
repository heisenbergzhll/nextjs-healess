import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {
  checkLength,
  containAlphabet,
  containNumber,
  containSymbol,
} from '@utils/Helper';
import UPDATE_PASSWORD from '@voguish/module-customer/graphql/mutation/updatePassword.graphql';
import { useCustomerMutation } from '@voguish/module-customer/hooks/useCustomerMutation';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import InputField from '@voguish/module-theme/components/ui/Form/Elements/Input';
import { useTranslation } from 'next-i18next';
import { FieldValues, useForm } from 'react-hook-form';
import {
  SuccessIcon,
  WarnIcon,
} from '../../../module-theme/components/elements/Icon';
import Sidebar from '../Layout/Sidebar';
import { ButtonMui } from '@packages/module-theme/components/ui/ButtonMui';
const commonstyle = {
  border: '1px solid',
  borderRadius: 1,
  borderColor: 'themeAdditional.borderColor',
};
const iconStyle = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'auto',
  marginTop: '2px',
  marginBottom: '2px',
};
const PasswordForm = () => {
  const [changeCustomerPassword, { loading: submitting }] = useCustomerMutation(UPDATE_PASSWORD);
  const { showToast } = useToast();
   const { t } = useTranslation('common');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm();

  /**
   * Code Password validation
   */
  const watchPassword = watch();

   const setPassword = (data: FieldValues) => {  
    if (data._cPassword !== data.newPassword) {
      setError('_cPassword', {
        message: t('New Password & Confirm is not same'),
      });
      return;
    }
    
    /**
     * Delete the confirm password key:value
     */
    const { _cPassword, ...mutationData } = data;  
    /**
     * Run the Mutation without confirm password
     */
    changeCustomerPassword({
      variables: mutationData,  
    })
      .then((response) => {
        if (response.data?.changeCustomerPassword) {
          showToast({
            type: 'success',
            message: t('Password updated successfully'),
          });
          reset({
            currentPassword: '',
            newPassword: '',
            _cPassword: '',
          });
        } else {
          setError('currentPassword', {
            message: t('The current password is invalid!'),
          });
        }
      })
      .catch((err) => {
        const errorMessage = err?.message || err?.graphQLErrors?.[0]?.message || '';
        
        if (errorMessage.includes('Invalid login or password')) {
          setError('currentPassword', {
            message: t('The current password is invalid!'),
          });
        } else {
          showToast({
            type: 'error',
            message: errorMessage,
          });
        }
      });
  };

  return (
    <Sidebar>
      <form onSubmit={handleSubmit(setPassword)}>
        <Box component="div" sx={{ ...commonstyle }}>
          <Grid container>
            <Grid item lg={12} md={12} xs={12} sm={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: 1,
                  p: 1.5,
                  borderColor: 'themeAdditional.borderColor',
                }}
              >
                <Typography
                  variant="h4"
                  className="font-semibold"
                  sx={{ mx: 1, flexGrow: 1 }}
                >
                  {t('Reset Your Password')}
                </Typography>
                <ButtonMui
                  className="rounded-[unset] bg-brand"
                  variant="contained"
                  type="submit"
                  isLoading={submitting}
                  isDisabled={submitting}
                  sx={{
                    maxWidth: { xs: '50%', md: '35%', lg: '151px' },
                    display: 'inline',
                    borderRadius: 0,
                    flexGrow: 1,
                  }}
                >
                  <span className="hidden sm:block">{t('Save Changes')}</span>
                  <span className="block sm:hidden"> {t('Save')}</span>
                </ButtonMui>
              </Box>
            </Grid>
          </Grid>
          <Grid
            container
            justifyContent="space-between"
            spacing={3}
            sx={{ px: 2, pt: 2 }}
          >
            <Grid item lg={6} sm={12} xs={12}>
              <label htmlFor="currentPassword">{t('Current Password')}</label>
              <InputField
                className="mt-0 mb-1 leading-0"
                placeHolder={t('Old password')}
                type="password"
                error={!!errors?.currentPassword?.message}
                helperText={errors?.currentPassword?.message || ''}
                {...register('currentPassword', {
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/,
                    message: t('Please enter a valid Password'),
                  },

                  required: t('* Current Password is required'),
                })}
              />
              <label htmlFor="newPassword">{t('New Password')}</label>
              <InputField
                placeHolder={t('New password')}
                type="password"
                className="mt-0 mb-1"
                error={!!errors?.newPassword?.message}
                helperText={errors?.newPassword?.message || ''}
                {...register('newPassword', {
                  required: t('* New Password is required'),
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/,
                    message: t('Please enter a valid Password'),
                  },
                })}
              />
              <label htmlFor="_cPassword">{t('Re-enter Password')}</label>
              <InputField
                placeHolder={t('Re-enter Password')}
                type="password"
                className="mt-0 mb-1.5"
                error={!!errors?._cPassword?.message}
                helperText={errors?._cPassword?.message || ''}
                {...register('_cPassword', {
                  required: t('* Re-enter Password is required'),
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,12}$/,
                    message: t('Please enter a valid Password'),
                  },
                })}
              />
            </Grid>
            <Grid item lg={5} sm={12} className="my-6 -md:w-full">
              <Box
                sx={{
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'themeAdditional.borderColor',
                  p: 2,
                  pt: 1,
                  pb: 1.95,
                }}
              >
                <Typography
                  variant="h3"
                  component="h3"
                  className="!text-brand"
                  sx={{ py: 1 }}
                >
                  {t('Password Must contain')}
                </Typography>
                <Box component="div" sx={iconStyle}>
                  {containAlphabet(watchPassword?.newPassword) ? (
                    <SuccessIcon />
                  ) : (
                    <WarnIcon />
                  )}

                  <Typography variant="body2" sx={{ px: 1 }}>
                    {' '}
                    {t('At least one uppercase (A-Z)')}
                  </Typography>
                </Box>
                <Box sx={iconStyle}>
                  {containNumber(watchPassword?.newPassword) ? (
                    <SuccessIcon />
                  ) : (
                    <WarnIcon />
                  )}
                  <Typography variant="body2" sx={{ px: 1 }}>
                    {t('At least one integer (0-9)')}
                  </Typography>
                </Box>
                <Box component="div" sx={iconStyle}>
                  {containSymbol(watchPassword?.newPassword) ? (
                    <SuccessIcon />
                  ) : (
                    <WarnIcon />
                  )}
                  <Typography variant="body2" sx={{ px: 1 }}>
                    {t('At least 1 symbol')}
                  </Typography>
                </Box>
                <Box component="div" sx={iconStyle}>
                  {checkLength(watchPassword?.newPassword) ? (
                    <SuccessIcon />
                  ) : (
                    <WarnIcon />
                  )}
                  <Typography variant="body2" sx={{ px: 1 }}>
                    {t('At least 8 characters')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </form>
    </Sidebar>
  );
};
export default PasswordForm;
