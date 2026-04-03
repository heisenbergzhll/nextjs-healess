import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { RightIcon } from '@voguish/module-theme/components/elements/Icon';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import {
  CheckBoxInputField,
  CountryRegionDropdown,
} from '@voguish/module-theme/components/ui/Form/Elements';
import { ButtonMui } from '@packages/module-theme/components/ui/ButtonMui';
import Modal from '@voguish/module-theme/components/Modal';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import InputField from '@voguish/module-theme/components/ui/Form/Elements/Input';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
/**
 * Define Datatype
 */
interface formValue {
  handleClose: Function;
  showModal: boolean;
  createCustomerAddress: Function;
  isLoading?: boolean;
}
interface ErrorType {
  message: string;
}

interface AddressInput {
  city: string;
  company?: string;
  country_code: string;
  firstname: string;
  lastname: string;
  postcode: string;
  street: string[];
  telephone: string;
  region: string;
  region_id: number | string;
  default_billing: boolean;
}
export function AddAddressModal({
  handleClose,
  showModal,
  createCustomerAddress,
  isLoading,
}: formValue) {
  /**
   * Use React form Hook
   */

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressInput>();

  /**
   * Watch value of country select box
   */
  const countryCode = watch('country_code');

  useEffect(() => {
    setValue('region_id', '0');
    setValue('region', 'Canillo');
  }, [countryCode, setValue]);
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const submitAddress = (formdata: FieldValues) => {
    let regionDetail;
    if (formdata?.region_id == '0') {
      regionDetail = {
        region: formdata?.region,
        region_id: 0,
      };
    } else {
      regionDetail = {
        region_id: formdata?.region_id,
      };
    }
    delete formdata?.region_id;
    formdata.region = regionDetail;

    createCustomerAddress({
      variables: {
        input: formdata,
      },
    })
      .then(() => {
        handleClose();
      })
      .catch((err: ErrorType) => {
        showToast({ message: err.message, type: 'error' });
        handleClose();
      });
    reset();
  };
  const HandleClose = () => {
    handleClose();
    reset();
  };
  return (
    <ErrorBoundary>
      <Modal
        showModal={showModal}
        hideModal={handleClose}
        title={
          <ErrorBoundary>
            {' '}
            <span
              className="flex cursor-pointer sm:hidden"
              onClick={() => handleClose()}
            >
              <RightIcon />
            </span>{' '}
            {t('Add Address')}
          </ErrorBoundary>
        }
        className="!z-[-4]"
      >
        <form
          onSubmit={handleSubmit(submitAddress)}
          className="h-full mt-4 -sm:mb-4 -sm:px-6"
        >
          {' '}
          <span className="grid min-w-full gap-2 sm:grid-cols-2">
            <div>
              <InputField
                label={t('First Name')}
                className="Customized placeholder:text-CheckoutPlaceHolder"
                type="text"
                placeHolder={t('First name')}
                error={!!errors?.firstname?.message}
                helperText={errors?.firstname?.message || ''}
                {...register('firstname', {
                  required: t('* Enter First Name'),
                })}
              />
            </div>
            <div>
              <InputField
                label={t('Last Name')}
                type="text"
                placeHolder={t('Last name')}
                sx="Customized"
                className="Customized placeholder:text-CheckoutPlaceHolder"
                error={!!errors?.lastname?.message}
                helperText={errors?.lastname?.message || ''}
                {...register('lastname', {
                  required: t('* Enter Last Name'),
                })}
              />
            </div>
          </span>
          <Grid item xs={12}>
            <InputField
              label={t('Company')}
              type="text"
              className="Customized placeholder:text-CheckoutPlaceHolder"
              placeHolder={t('Company')}
              error={!!errors?.company?.message}
              helperText={errors?.company?.message || ''}
              {...register('company', {
                required: t('* Enter Company Name'),
              })}
            />
          </Grid>
          <Grid item xs={12}>
            <InputField
              label={t('Address 1')}
              className="Customized placeholder:text-CheckoutPlaceHolder"
              type="text"
              placeHolder={t('Address 1')}
              error={!!errors.street?.[0]?.message}
              helperText={errors?.street?.[0]?.message || ''}
              {...register('street.0', {
                required: t('* Enter Address1'),
              })}
            />
          </Grid>
          <Grid item xs={12}>
            <InputField
              label={t('Address 2')}
              className="Customized placeholder:text-CheckoutPlaceHolder"
              type="text"
              placeHolder={t('Address 2')}
              error={!!errors?.street?.[0]?.message}
              helperText={errors?.street?.[0]?.message || ''}
              {...register('street.1', {
                required: t('* Enter Address2'),
              })}
            />
          </Grid>
          <span className="grid min-w-full gap-2 sm:grid-cols-2">
            <div>
              <InputField
                label={t('City')}
                placeHolder={t('City')}
                type="text"
                className="Customized placeholder:text-CheckoutPlaceHolder"
                error={!!errors?.city?.message}
                helperText={errors?.city?.message || ''}
                {...register('city', {
                  required: t('* Enter city Name'),
                })}
              />
            </div>
            <div>
              <InputField
                label={t('Zip Code')}
                type="text"
                placeHolder={t('Zip code')}
                className="Customized placeholder:text-CheckoutPlaceHolder"
                error={!!errors?.postcode?.message}
                helperText={errors?.postcode?.message || ''}
                {...register('postcode', {
                  required: t('* Enter Post Code'),
                })}
              />
            </div>
          </span>
          <Grid item className="w-ful">
            <InputField
              label={t('Phone')}
              type="text"
              placeHolder={t('Phone number')}
              className="Customized placeholder:text-CheckoutPlaceHolder"
              error={!!errors?.telephone?.message}
              helperText={errors?.telephone?.message || ''}
              {...register('telephone', {
                required: t('* Enter Telephone Number'),
              })}
            />
          </Grid>
          <div className="z-[-1]">
            <CountryRegionDropdown
              labelName
              selectedCountryCode={countryCode || 'AD'}
              selectedRegionId=""
              countryRegister={{
                ...register('country_code', {
                  required: t('* Select Country'),
                }),
                helperText: errors?.country_code?.message || '',
              }}
              regionIdRegister={{
                ...register('region_id', {
                  required: t('* Select State/Region'),
                }),
                helperText: errors.region_id?.message || '',
              }}
              regionRegister={{
                ...register('region', {
                  required: t('* Enter State/region'),
                }),
                helperText: errors.region?.message || '',
              }}
            />
          </div>
          <Grid item xs={12} className="pb-2 mt-0">
            <div>
              <CheckBoxInputField
                label={t('Set as default address')}
                {...register('default_billing')}
              />
            </div>
            <Grid className="flex !mb-0 !pb-0 items-center justify-end gap-6 py-4">
              <Button
                className="float-left mr-5 hidden w-32 rounded-[unset] border border-solid border-darkGreyBackground text-darkGreyBackground hover:border-darkBackground hover:bg-darkBackground hover:text-white sm:flex md:float-right md:w-40 lg:float-right lg:w-40 xl:float-right xl:w-40"
                variant="outlined"
                onClick={HandleClose}
              >
                {t('Cancel')}
              </Button>

              <ButtonMui
                type="submit"
                className="float-right mr-0 w-full rounded-[unset] pl-0 pr-0 text-center sm:w-32 md:w-40 lg:w-40 xl:w-40"
                variant="contained"
                isLoading={isLoading}
              >
                {t('Submit')}
              </ButtonMui>
            </Grid>
          </Grid>
        </form>
      </Modal>
    </ErrorBoundary>
  );
}
