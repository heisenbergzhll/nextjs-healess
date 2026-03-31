import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { RightIcon } from '@voguish/module-theme/components/elements/Icon';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Modal from '@voguish/module-theme/components/Modal';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import {
  CheckBoxInputField,
  CountryRegionDropdown,
} from '@voguish/module-theme/components/ui/Form/Elements';
import InputField from '@voguish/module-theme/components/ui/Form/Elements/Input';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { ButtonMui } from '@packages/module-theme/components/ui/ButtonMui';
/**
 * Set DataType for address Input field
 */
interface AddressInput {
  firstname: string;
  lastname: string;
  city: string;
  company: string;
  country_code: string;
  postcode: string;
  region_id: string;
  region: string;
  street?: string[];
  telephone: string;
  default_billing?: boolean;
}

/**
 * Props Data datatye of component
 */
interface EditTypeModal {
  showEditModelData: {
    firstname?: string;
    lastname?: string;
    city?: string;
    country_code?: string;
    company?: string;
    postcode?: string;
    region?: {
      region: string;
      region_id: number;
    };
    street?: [];
    telephone?: string;
    default_billing?: boolean;
    id?: number;
  };
  isLoadingUpdate?: boolean;
  hideModal: Function;
  updateCustomerAddress: Function;
}
/**
 * Show Error Datatype with showtoast
 */
interface ErrorType {
  message: string;
}

export const EditaddressModel = ({
  showEditModelData,
  hideModal,
  updateCustomerAddress,
  isLoadingUpdate,
}: EditTypeModal) => {
  /**
   * Create Object to default value for form
   */
  const AddressDefaultData = {
    firstname: `${showEditModelData.firstname || ''}`,
    lastname: `${showEditModelData.lastname || ''}`,
    city: `${showEditModelData.city || ''}`,
    company: `${showEditModelData.company}`,
    country_code: `${showEditModelData.country_code || ''}`,
    postcode: `${showEditModelData.postcode || ''}`,
    region_id: `${showEditModelData.region?.region_id || ''}`,
    region: `${showEditModelData?.region?.region}`,
    street: showEditModelData?.street,
    telephone: `${showEditModelData?.telephone}`,
    default_billing: showEditModelData?.default_billing,
  };

  /**
   * React Form Hook
   */
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressInput>({
    values: AddressDefaultData,
  });
  /**
   * This function help in close and open modal box based on true false value
   * @param addressid
   * @returns
   */
  function CheckmodalStatus(addressid?: number) {
    return !!addressid;
  }
  const { showToast } = useToast();
  const { t } = useTranslation('common');
  const countryCode = watch('country_code');
  const region_id = watch('region_id');
  useEffect(() => {
    if (countryCode !== showEditModelData?.country_code || region_id == '') {
      setValue('region_id', '0');
    }
  }, [countryCode, region_id, showEditModelData?.country_code, setValue]);
  const submitAddress = (formdata: FieldValues) => {
    let regionDetail;
    if (formdata?.region == '' || formdata?.region_id == 0) {
      regionDetail = {
        region: formdata?.region,
        region_id: 0,
      };
    } else {
      regionDetail = {
        region_id: Number(formdata?.region_id),
      };
    }
    delete formdata?.region_id;
    formdata.region = regionDetail;
    updateCustomerAddress({
      variables: {
        id: showEditModelData?.id,
        input: formdata,
      },
    })
      .then(() => {
        showToast({
          type: 'success',
          message: t('Address updated successfully'),
        });
        hideModal();
      })
      .catch((err: ErrorType) => {
        showToast({ message: err.message, type: 'error' });
        hideModal();
      });
  };

  return (
    <ErrorBoundary>
      <Modal
        showModal={CheckmodalStatus(showEditModelData?.id)}
        hideModal={() => hideModal()}
        title={
          <ErrorBoundary>
            {' '}
            <span
              className="flex cursor-pointer sm:hidden"
              onClick={() => {
                hideModal();
              }}
            >
              <RightIcon />
            </span>{' '}
            {t('Edit Address')}
          </ErrorBoundary>
        }
      >
        <form
          onSubmit={handleSubmit(submitAddress)}
          className="h-full mt-4 -sm:mb-4 -sm:px-6"
        >
          <span className="grid min-w-full gap-3 sm:grid-cols-2">
            <Grid item>
              <InputField
                label={t('First Name')}
                className="Customized placeholder:text-CheckoutPlaceHolder"
                placeHolder={t('First Name')}
                type="text"
                error={!!errors?.firstname?.message}
                helperText={errors?.firstname?.message || ''}
                {...register('firstname', {
                  required: t('* Enter First Name'),
                })}
              />
            </Grid>
            <Grid item>
              <InputField
                label={t('Last Name')}
                placeHolder={t('Last Name')}
                type="text"
                className="Customized placeholder:text-CheckoutPlaceHolder"
                error={!!errors?.lastname?.message}
                helperText={errors?.lastname?.message || ''}
                {...register('lastname', {
                  required: t('* Enter Last Name'),
                })}
              />
            </Grid>
          </span>
          <Grid item xs={12}>
            <InputField
              label={t('Company')}
              className="Customized placeholder:text-CheckoutPlaceHolder"
              type="text"
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
              type="text"
              className="Customized placeholder:text-CheckoutPlaceHolder"
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
              type="text"
              className="Customized placeholder:text-CheckoutPlaceHolder"
              placeHolder={t('Address 2')}
              error={!!errors.street?.[1]?.message}
              helperText={errors?.street?.[1]?.message || ''}
              {...register('street.1', {
                required: t('* Enter Address2'),
              })}
            />
          </Grid>
          <span className="grid min-w-full sm:grid-cols-2 sm:gap-3">
            <Grid item className="sm:mb-1.5">
              <InputField
                label={t('City')}
                type="text"
                className="Customized placeholder:text-CheckoutPlaceHolder"
                {...register('city')}
                error={!!errors?.city?.message}
                helperText={errors?.city?.message || ''}
                {...register('city', {
                  required: t('* Enter city Name'),
                })}
              />
            </Grid>
            <Grid item className="sm:mb-1.5">
              <InputField
                label={t('Zip Code')}
                type="text"
                className="Customized placeholder:text-CheckoutPlaceHolder"
                error={!!errors?.postcode?.message}
                helperText={errors?.postcode?.message || ''}
                {...register('postcode', {
                  required: t('* Enter Post Code'),
                })}
              />
            </Grid>
          </span>
          <Grid item xs={12} className="sm:mb-1.5">
            <InputField
              label={t('Phone')}
              type="text"
              className="Customized placeholder:text-CheckoutPlaceHolder"
              error={!!errors?.telephone?.message}
              helperText={errors?.telephone?.message || ''}
              {...register('telephone', {
                required: t('* Enter Telephone Number'),
              })}
            />
          </Grid>
          <Grid item xs={12} className="mb-0 sm:mt-1 sm:pb-1">
            {
              <CountryRegionDropdown
                labelName
                selectedCountryCode={countryCode}
                selectedRegionId={`${
                  showEditModelData?.region?.region_id || '0'
                }`}
                selectedRegion={showEditModelData?.region?.region || ''}
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
            }
          </Grid>
          <Grid item xs={12} className="sm:mb-1 sm:mt-[-10px]">
            <CheckBoxInputField
              label={t('Set as default address')}
              defaultChecked={showEditModelData?.default_billing}
              {...register('default_billing')}
            />
          </Grid>
          <Grid className="flex items-center !mb-0 !pb-0 justify-end gap-6 py-4">
            <Button
              className="float-left mr-5 hidden w-32 rounded-[unset] border border-solid border-darkGreyBackground text-darkGreyBackground hover:border-darkBackground hover:bg-darkBackground hover:text-white sm:flex md:float-right md:w-40 lg:float-right lg:w-40 xl:float-right xl:w-40"
              variant="outlined"
              onClick={() => hideModal()}
            >
              {t('Cancel')}
            </Button>

            <ButtonMui
              type="submit"
              className="float-right mr-0 w-full rounded-[unset] pl-0 pr-0 text-center sm:w-32 md:w-40 lg:w-40 xl:w-40"
              variant="contained"
              isLoading={isLoadingUpdate}
            >
              {t('Submit')}
            </ButtonMui>
          </Grid>
        </form>
      </Modal>
    </ErrorBoundary>
  );
};
