import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { AddAddressModal } from '@voguish/module-customer/Components/AddressTab/AddAddressModal';
import { AddressPlaceHolder } from '@voguish/module-customer/Components/AddressTab/AddressPlaceHolder';
import { DeleteModal } from '@voguish/module-customer/Components/AddressTab/DeleteModal';
import { EditaddressModel } from '@voguish/module-customer/Components/AddressTab/EditaddressModel';
import { NoAddress } from '@voguish/module-customer/Components/AddressTab/NoAddress';
import { useCustomerMutation } from '@voguish/module-customer/hooks/useCustomerMutation';
import { useCustomerQuery } from '@voguish/module-customer/hooks/useCustomerQuery';

import { isValidArray } from '@utils/Helper';
import GET_CUSTOMER_ADDRESS from '@voguish/module-customer/graphql/CustomerAddress.graphql';
import CREATE_ADDRESS from '@voguish/module-customer/graphql/mutation/CreateCustomerAddress.graphql';
import DELETE_ADDRESS from '@voguish/module-customer/graphql/mutation/DeleteAddress.graphql';
import UPDATE_CUSTOMER_ADDRESS from '@voguish/module-customer/graphql/mutation/UpdateCustomerAddress.graphql';
import {
  AccountNameIcon,
  AddIcon,
  DeleteIcon,
  HomeIcon,
  OfficeIcon,
  OneStarIcon,
} from '@voguish/module-theme/components/elements/Icon';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { Button, Chip } from '~node_modules/@mui/material';
import { useToast } from '~packages/module-theme/components/toast/hooks';
import Sidebar from '../Layout/Sidebar';
const commonStyles = {
  bgcolor: 'background.paper',
  // mb: 2,
  // border: 1,
  // borderRadius: 1,
  // borderColor: 'themeAdditional.borderColor',
};

/**
 *  Get Country name from Country code using JavaScript
 */
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
/**
 * Define dataType  for customer Address
 */
interface AddressDataType {
  default_billing: boolean;
  default_shipping: boolean;
  firstname: string;
  lastname: string;
  id: number;
  company: string;
  telephone: string;
  street: [];
  city: string;
  postcode: string;
  country_code: string;
  region: CustomerAddressRegion;
}
interface CustomerAddressRegion {
  region: string;
}
/**
 * Show Error Datatype with showtoast
 */
interface ErrorType {
  message: string;
}

const AddressList = () => {
  /**
   * Get customer Addresses
   */
  const { data, loading, refetch /* ,error*/ } =
    useCustomerQuery(GET_CUSTOMER_ADDRESS);
  const addresses = data?.customer?.addresses;

  /**
   * Code for Add Customer Address
   */
  const [addModal, setAddmodal] = useState<boolean>(false);
  const [
    createCustomerAddress,
    {
      data: returnAddresseData /* , error: addAddressError */,
      loading: isLoadingAdd,
    },
  ] = useCustomerMutation(CREATE_ADDRESS);

  const addQueryResponse = returnAddresseData?.createCustomerAddress || null;
  if (addQueryResponse) {
    refetch();
  }

  /**
   * Code for delete Customer Address
   */
  const [mountDeleteModal, setMountDeleteModal] = useState(0);
  const { showToast } = useToast();
  const handleDelete = (addressId: number) => {
    setMountDeleteModal(addressId);
  };
  const [
    deleteCustomerAddress,
    { data: returnDeleteData /*, error: deleteError */ },
  ] = useCustomerMutation(DELETE_ADDRESS);
  const response = returnDeleteData?.deleteCustomerAddress || null;
  if (response) {
    refetch();
  }

  /**
   * Code For Edit address
   */
  const [
    updateCustomerAddress,
    { data: returnData /*, error: returnError */, loading: isLoadingUpdate },
  ] = useCustomerMutation(UPDATE_CUSTOMER_ADDRESS);

  const updateResponse = returnData?.updateCustomerAddress || null;
  if (updateResponse) {
    refetch();
  }
  const { t } = useTranslation('common');

  const [mountEditModal, setMountEditModal] = useState({});
  const handleEdit = (addressData: object) => {
    setMountEditModal(addressData);
  };

  const handleSetDefault = (addressData: FieldValues) => {
    updateCustomerAddress({
      variables: {
        id: addressData?.id,
        input: {
          default_shipping: true,
        },
      },
    })
      .then(() => {
        showToast({
          type: 'success',
          message: t('Set as default address successfully'),
        });
      })
      .catch((err: ErrorType) => {
        showToast({ message: err.message, type: 'error' });
      });
  };
  const handleClose = () => {
    setAddmodal(false);
  };
  const AddressCard = ({ props }: any) => {
    return (
      <ErrorBoundary>
        <Box
          className={`${
            props?.default_shipping ? 'border-[#BB742F]' : 'border-[#E2E8F0]'
          } border border-solid rounded-2xl`}
        >
          <div className="flex justify-between px-2 py-1 border-0 border-b border-[#F1F5F9] border-solid px-[24px]">
            <div className="flex items-center px-1 font-medium gap-2">
              {!props?.default_shipping ? (
                <OfficeIcon />
              ) : (
                <HomeIcon className="text-brand" />
              )}
              <Typography
                variant="caption"
                className={`${
                  props?.default_shipping ? 'text-black' : 'text-black'
                } uppercase bg-transparent pl-0 font-semibold text-sm`}
              >
                <span>{props?.company ? t('Office') : t('Home')}</span>
              </Typography>

              {props?.default_shipping && (
                <Chip
                  icon={<OneStarIcon />}
                  label={t('Default')}
                  variant="outlined"
                  sx={{
                    borderRadius: '1.5rem',
                    border: 'none',
                    borderColor: 'transparent',
                    px: 1.5,
                    py: 1,
                    height: '20px',
                    color: '#BB742F',
                    backgroundColor: '#FEF7ED',
                    '& .MuiChip-icon': {
                      color: '#BB742F',
                    },
                    '& .MuiChip-label': {
                      fontSize: '12px',
                      fontWeight: 500,
                      pl: 1,
                      pr: 0,
                    },
                  }}
                />
              )}
            </div>
            <div className="flex justify-end">
              <IconButton
                aria-label="edit"
                onClick={() => handleEdit(props)}
                disableRipple
                disableTouchRipple
                sx={{
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&:active': {
                    backgroundColor: 'transparent',
                  },
                  '&:focus': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <AccountNameIcon />
              </IconButton>

              <IconButton
                aria-label="delete"
                disabled={!!props?.default_shipping || addresses?.length == 1}
                onClick={() => handleDelete(props?.id)}
                disableRipple
                disableTouchRipple
                sx={{
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&:active': {
                    backgroundColor: 'transparent',
                  },
                  '&:focus': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
          <div className="px-[24px] py-4 text-sm">
            <div className="min-h-[44px]">
              <Typography
                className="text-sm text-black font-medium mb-1"
                variant="body1"
              >
                {props?.firstname + ' ' + props?.lastname}
              </Typography>
              <Typography
                variant="body1"
                className="text-sm text-[#62748E] mb-1"
              >
                {props?.company}
              </Typography>
            </div>
            <section className="mt-2 text-[#62748E] leading-[20px]">
              {props.street.map(
                (customerStreet: string, streetIndex: number) => (
                  <div
                    className="text-sm font-light leading-[20px]"
                    key={streetIndex}
                  >
                    {customerStreet}
                  </div>
                )
              )}
              <Typography
                className="text-sm font-light leading-[20px]"
                variant="body1"
              >
                {props?.city + '-' + props?.postcode}
              </Typography>

              <Typography
                className="text-sm font-light leading-[20px]"
                variant="body1"
              >
                {props?.region.region}
              </Typography>
              <Typography
                className="text-sm font-light leading-[20px]"
                variant="body1"
              >
                {regionNames.of(props?.country_code)}
              </Typography>
            </section>

            <Typography
              className="text-sm text-black font-medium mt-1"
              variant="body1"
            >
              {props?.telephone}
            </Typography>
          </div>
          <div
            className={`${props?.default_shipping ? 'border-white' : ' border-[#F1F5F9] '} border-t  border-solid flex justify-between px-2 py-1 border-0  px-[24px] min-h-[50px] `}
          >
            <div className="flex justify-end">
              <IconButton
                onClick={() => handleSetDefault(props)}
                disableRipple
                disableTouchRipple
                className="text-brand text-sm font-medium px-0"
                sx={{
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&:active': {
                    backgroundColor: 'transparent',
                  },
                  '&:focus': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {props?.default_shipping ? '' : 'Set as Default'}
              </IconButton>
            </div>
          </div>
        </Box>
      </ErrorBoundary>
    );
  };
  return (
    <ErrorBoundary>
      {' '}
      <Sidebar>
        <Grid
          className="mb-3 lg:mb-6"
          container
          sx={{ ...commonStyles }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <div className="">
              <Typography
                variant="h4"
                component="div"
                className="font-medium text-[1.5rem] h-[2.25rem] leading-[2.25rem]"
              >
                {t('My Addresses')}
              </Typography>
              <Typography
                variant="body1"
                component="div"
                className="font-light text-[#62748E] text-sm h-[1.3125rem] leading-[1.3125rem] tracking-normal"
              >
                {t('Manage your delivery addresses')}
              </Typography>
            </div>
          </Grid>
          <Grid item>
            {/* <Button
              variant="contained"
              className="rounded-none shadow-none !bg-brand"
              onClick={() => setAddmodal(true)}
            >
              <span className="hidden sm:block">{t('Add new address')}</span>
              <span className="block sm:hidden">{t('Add')}</span>
            </Button> */}
            <Button
              variant="contained"
              startIcon={<AddIcon className="text-white" />}
              sx={{
                '&:hover': {
                  backgroundColor: 'black',
                },
              }}
              className="rounded-2xl text-white text-base font-medium bg-black max-h-[40px]"
              onClick={() => setAddmodal(true)}
            >
              <span className="hidden sm:block">{t('Add New Address')}</span>
              <span className="block sm:hidden">{t('Add')}</span>
            </Button>
          </Grid>
        </Grid>

        {loading ? (
          <AddressPlaceHolder />
        ) : isValidArray(addresses) ? (
          <div className="grid grid-cols-12 gap-4">
            {addresses.map((address: AddressDataType, index: number) => (
              <Box
                className="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6"
                key={index}
              >
                <ErrorBoundary>
                  <AddressCard props={address} />
                </ErrorBoundary>
              </Box>
            ))}
          </div>
        ) : (
          <NoAddress />
        )}
        <ErrorBoundary>
          <DeleteModal
            deleteCustomerAddress={deleteCustomerAddress}
            deleteDataId={mountDeleteModal}
            handleClick={() => setMountDeleteModal(0)}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <AddAddressModal
            showModal={addModal}
            createCustomerAddress={createCustomerAddress}
            handleClose={handleClose}
            isLoading={isLoadingAdd}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <EditaddressModel
            showEditModelData={mountEditModal}
            updateCustomerAddress={updateCustomerAddress}
            hideModal={() => setMountEditModal({})}
            isLoadingUpdate={isLoadingUpdate}
          />
        </ErrorBoundary>
      </Sidebar>
    </ErrorBoundary>
  );
};
export default AddressList;
