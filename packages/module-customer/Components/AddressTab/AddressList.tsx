import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
  DeleteIcon,
  EditIcon,
} from '@voguish/module-theme/components/elements/Icon';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import Sidebar from '../Layout/Sidebar';
const commonStyles = {
  bgcolor: 'background.paper',
  mb: 2,
  border: 1,
  borderRadius: 1,
  borderColor: 'themeAdditional.borderColor',
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
  const handleClose = () => {
    setAddmodal(false);
  };
  const AddressCard = ({ props }: any) => {
    return (
      <ErrorBoundary>
        <Box className="border border-gray-200 border-solid rounded-md">
          <div className="flex justify-between px-2 py-1 border-0 border-b border-gray-200 border-solid">
            <div className="flex items-center px-1 font-medium">
              <Typography
                variant="caption"
                className={`${
                  props?.default_billing ? 'text-brand' : '  '
                } uppercase bg-transparent pl-0 font-semibold mt-1`}
              >
                {props?.default_billing
                  ? t('Default Address')
                  : t('Other Address')}
              </Typography>
            </div>
            <div className="flex justify-around">
              <IconButton aria-label="edit" onClick={() => handleEdit(props)}>
                <EditIcon />
              </IconButton>

              <IconButton
                aria-label="delete"
                disabled={!!props?.default_billing || addresses?.length == 1}
                onClick={() => handleDelete(props?.id)}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
          <div className="px-3 py-2 text-sm">
            <Typography className="text-sm" variant="body1">
              {props?.firstname + ' ' + props?.lastname}
            </Typography>
            <Typography variant="body1" className="text-sm">
              {props?.company}
            </Typography>
            <Typography variant="body1" className="text-sm">
              {props?.telephone}
            </Typography>
            <section className="mt-2">
              {props.street.map(
                (customerStreet: string, streetIndex: number) => (
                  <span className="text-sm font-medium" key={streetIndex}>
                    {customerStreet} {' , '}
                  </span>
                )
              )}
              <Typography className="text-sm font-medium" variant="body1">
                {props?.city + '-' + props?.postcode}
              </Typography>

              <Typography className="text-sm font-medium" variant="body1">
                {props?.region.region} , {regionNames.of(props?.country_code)}
              </Typography>
              <Typography className="text-sm font-medium" variant="body1">
                {t('Tx: ') + props?.telephone}
              </Typography>
            </section>
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
          container
          sx={{ px: 2, py: 1, ...commonStyles }}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography
              variant="h4"
              className="text-lg font-semibold uppercase"
            >
              {t('Address Book')}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              className="rounded-none shadow-none !bg-brand"
              onClick={() => setAddmodal(true)}
            >
              <span className="hidden sm:block">{t('Add new address')}</span>
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
                className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-4"
                key={index}
              >
                <ErrorBoundary>
                  {' '}
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
