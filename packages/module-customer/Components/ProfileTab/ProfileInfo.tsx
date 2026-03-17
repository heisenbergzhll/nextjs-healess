import { Button, Input } from '@headlessui/react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import UPDATE_CUSTOMER from '@voguish/module-customer/graphql/mutation/UpdateCustomer.graphql';
import { AccountNameIcon } from '@voguish/module-theme/components/elements/Icon';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { EmailOutlined } from '~node_modules/@mui/icons-material';
import { Avatar } from '~node_modules/@mui/material';
import { useCustomerMutation } from '~packages/module-customer/hooks/useCustomerMutation';
import { useToast } from '~packages/module-theme/components/toast/hooks';
import { stringAvatar } from '~utils/Helper';
const EditIcon = dynamic(() => import('@mui/icons-material/Edit'));

const commonStyles = {
  bgcolor: 'background.paper',
  // border: 1,
  // borderRadius: 1,
  borderColor: 'themeAdditional.borderColor',
};
type userinfoDataType = {
  userinfoData: {
    customer: {
      firstname: string;
      lastname: string;
      email: string;
      phone_number: string;
      date_of_birth: string;
    };
  };
  handleClick: Function;
  handleRefetch: Function;
};
const ProfileInfo = ({
  userinfoData,
  handleClick,
  handleRefetch,
}: userinfoDataType) => {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const [updateCustomer, { loading }] = useCustomerMutation(UPDATE_CUSTOMER);

  const [editingField, setEditingField] = useState<
    | 'firstname'
    | 'lastname'
    | 'address'
    | 'email'
    | 'phone_number'
    | 'date_of_birth'
    | null
  >(null);
  const [editValue, setEditValue] = useState('');

  const handleEditClick = (
    field:
      | 'firstname'
      | 'lastname'
      | 'address'
      | 'email'
      | 'phone_number'
      | 'date_of_birth',
    currentValue: string
  ) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = () => {
    // TODO: 调用保存 API
    let validFormdata = null;
    if (editingField === 'firstname') {
      validFormdata = {
        firstname: editValue,
      };
    } else if (editingField === 'lastname') {
      validFormdata = {
        lastname: editValue,
      };
    } else if (editingField === 'email') {
      validFormdata = {
        email: editValue,
      };
    } else if (editingField === 'phone_number') {
      validFormdata = {
        phone_number: editValue,
      };
    } else if (editingField === 'date_of_birth') {
      validFormdata = {
        date_of_birth: editValue,
      };
    }
    // validFormdata = {
    //   firstname:
    //     editingField === 'firstname'
    //       ? editValue
    //       : `${session?.user?.firstname || ''}`,
    //   lastname:
    //     editingField === 'lastname'
    //       ? editValue
    //       : `${session?.user?.lastname || ''}`,
    //   email:
    //     editingField === 'email' ? editValue : `${session?.user?.email || ''}`,
    //   // password: editingField === `${data.password || ''}`,
    //   // is_seller: data.is_seller == 0 ? false : true || false,
    //   // profileurl: data.profileurl ? data.profileurl : '',
    // };
    updateCustomer({
      variables: {
        input: validFormdata,
      },
    })
      .then(() => {
        showToast({
          type: 'success',
          message: t('profile updated successfully'),
        });
        handleClick(false);
        handleRefetch();
      })
      .catch((err) => {
        showToast({ message: err.message, type: 'error' });
      });

    setEditingField(null);
    setEditValue('');
  };
  return (
    <ErrorBoundary>
      <div className="mb-6">
        <Typography
          variant="h4"
          component="div"
          className="font-medium text-[1.5rem] h-[2.25rem] leading-[2.25rem]"
        >
          {t('My Profile')}
        </Typography>
        <Typography
          variant="body1"
          component="div"
          className="font-light text-[#62748E] text-sm h-[1.3125rem] leading-[1.3125rem] tracking-normal"
        >
          {t('Manage your personal information and preferences')}
        </Typography>
      </div>
      <Grid
        container
        sx={{ ...commonStyles }}
        className="box-border border border-solid border-[#E2E8F0] rounded-2xl mb-6"
      >
        <Grid
          className="relative flex items-center justify-between px-4"
          item
          sx={{ flexGrow: 1 }}
        >
          <div className="flex items-center justify-center  gap-6 p-6">
            <Avatar
              {...stringAvatar(userinfoData?.customer?.firstname ?? 'U')}
              className="w-[80px] h-[80px] bg-brand uppercase font-medium text-[2rem]"
            />
            <div className="flex flex-col justify-center gap-y-1">
              <p className="font-medium text-lg">
                {userinfoData?.customer?.firstname}{' '}
                {userinfoData?.customer?.lastname}
              </p>
              <p className="text-xs text-[#62748E]">
                {userinfoData?.customer?.email}
              </p>
            </div>
          </div>
        </Grid>
      </Grid>

      <Grid
        container
        sx={{ ...commonStyles }}
        className="box-border border border-solid border-[#E2E8F0] rounded-2xl mb-6"
      >
        <Grid
          className="relative flex items-center justify-between "
          item
          sx={{ flexGrow: 1 }}
        >
          <div className="flex w-full flex-col gap-1">
            <div className="flex  px-6 py-3 gap-3 border-solid border-0 border-b border-[#F1F5F9]">
              <span className=" font-medium	 text-2xl tracking-widest text-[#101828]">
                Personal Information
              </span>
            </div>

            <div className="flex  px-6 py-3  border-solid border-0 border-b border-[#F1F5F9]">
              <div className="group flex-1 flex items-center py-2 no-underline gap-3">
                <AccountNameIcon className="text-[#90A1B9] text-base" />
                <span className="text-sm tracking-widest text-[#62748E] duration-150 transition-colors">
                  {t('First Name')}
                </span>
              </div>
              <div
                className="group  flex items-center py-1 no-underline gap-3"
                style={{ flex: 2 }}
              >
                {editingField === 'firstname' ? (
                  <Input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full text-sm tracking-widest text-[#101828] bg-[#FFF8F1] border border-[#BB742F] rounded px-2 py-2 outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm tracking-widest text-[#101828] duration-150 transition-colors">
                    {userinfoData?.customer?.firstname || ''}
                  </span>
                )}
              </div>
              <div className="group  flex items-center  no-underline gap-1 justify-end">
                {editingField === 'firstname' ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="w-[32px] h-[32px] bg-[#101828] rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity border-none ml-2"
                    >
                      <CheckIcon className="text-white w-[14px] h-[14px]" />
                    </Button>
                    <Button
                      onClick={handleCancel}
                      className="w-[32px] h-[32px] bg-[#F1F5F9] rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity ml-2 border-none"
                    >
                      <CloseIcon className="text-[#62748E] w-[14px] h-[14px]" />
                    </Button>
                  </>
                ) : (
                  <span
                    onClick={() =>
                      handleEditClick(
                        'firstname',
                        userinfoData?.customer?.firstname || ''
                      )
                    }
                    className="text-sm tracking-widest text-[#BB742F] duration-150 transition-colors cursor-pointer"
                  >
                    {t('Edit')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex  px-6 py-3  border-solid border-0 border-b border-[#F1F5F9]">
              <div className="group flex-1 flex items-center py-2 no-underline gap-3">
                <AccountNameIcon className="text-[#90A1B9] text-base" />
                <span className="text-sm tracking-widest text-[#62748E] duration-150 transition-colors">
                  {t('Last Name')}
                </span>
              </div>
              <div
                className="group  flex items-center py-1 no-underline gap-3"
                style={{ flex: 2 }}
              >
                {editingField === 'lastname' ? (
                  <Input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full text-sm tracking-widest text-[#101828] bg-[#FFF8F1] border border-[#BB742F] rounded px-2 py-2 outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm tracking-widest text-[#101828] duration-150 transition-colors">
                    {userinfoData?.customer?.lastname || ''}
                  </span>
                )}
              </div>
              <div className="group  flex items-center  no-underline gap-1 justify-end">
                {editingField === 'lastname' ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="w-[32px] h-[32px] bg-[#101828] rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity border-none ml-2"
                    >
                      <CheckIcon className="text-white w-[14px] h-[14px]" />
                    </Button>
                    <Button
                      onClick={handleCancel}
                      className="w-[32px] h-[32px] bg-[#F1F5F9] rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity ml-2 border-none"
                    >
                      <CloseIcon className="text-[#62748E] w-[14px] h-[14px]" />
                    </Button>
                  </>
                ) : (
                  <span
                    onClick={() =>
                      handleEditClick(
                        'lastname',
                        userinfoData?.customer?.lastname || ''
                      )
                    }
                    className="text-sm tracking-widest text-[#BB742F] duration-150 transition-colors cursor-pointer"
                  >
                    {t('Edit')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex  px-6 py-3  border-solid border-0 border-b border-[#F1F5F9]">
              <div className="group flex-1 flex items-center py-2 no-underline gap-3">
                <EmailOutlined className="text-[#90A1B9] text-base" />
                <span className="text-sm tracking-widest text-[#62748E] duration-150 transition-colors">
                  {t('Email Address')}
                </span>
              </div>
              <div
                className="group  flex items-center py-1 no-underline gap-3"
                style={{ flex: 2 }}
              >
                {editingField === 'email' ? (
                  <Input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full text-sm tracking-widest text-[#101828] bg-[#FFF8F1] border border-[#BB742F] rounded px-2 py-2 outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm tracking-widest text-[#101828] duration-150 transition-colors">
                    {userinfoData?.customer?.email || ''}
                  </span>
                )}
              </div>
              <div className="group  flex items-center  no-underline gap-1 justify-end">
                {editingField === 'email' ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="w-[32px] h-[32px] bg-[#101828] rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity border-none ml-2"
                    >
                      <CheckIcon className="text-white w-[14px] h-[14px]" />
                    </Button>
                    <Button
                      onClick={handleCancel}
                      className="w-[32px] h-[32px] bg-[#F1F5F9] rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity ml-2 border-none"
                    >
                      <CloseIcon className="text-[#62748E] w-[14px] h-[14px]" />
                    </Button>
                  </>
                ) : (
                  <span
                    onClick={() =>
                      handleEditClick(
                        'email',
                        userinfoData?.customer?.email || ''
                      )
                    }
                    className="text-sm tracking-widest text-[#BB742F] duration-150 transition-colors cursor-pointer"
                  >
                    {t('Edit')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex  px-6 py-3  border-solid border-0 border-b border-[#F1F5F9]">
              <div className="group flex-1 flex items-center py-2 no-underline gap-3">
                <EmailOutlined className="text-[#90A1B9] text-base" />
                <span className="text-sm tracking-widest text-[#62748E] duration-150 transition-colors">
                  {t('Phone Number')}
                </span>
              </div>
              <div
                className="group  flex items-center py-1 no-underline gap-3"
                style={{ flex: 2 }}
              >
                {editingField === 'phone_number' ? (
                  <Input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full text-sm tracking-widest text-[#101828] bg-[#FFF8F1] border border-[#BB742F] rounded px-2 py-2 outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm tracking-widest text-[#101828] duration-150 transition-colors">
                    {userinfoData?.customer?.phone_number || ''}
                  </span>
                )}
              </div>
              <div className="group  flex items-center  no-underline gap-1 justify-end">
                {editingField === 'phone_number' ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="w-[32px] h-[32px] bg-[#101828] rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity border-none ml-2"
                    >
                      <CheckIcon className="text-white w-[14px] h-[14px]" />
                    </Button>
                    <Button
                      onClick={handleCancel}
                      className="w-[32px] h-[32px] bg-[#F1F5F9] rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity ml-2 border-none"
                    >
                      <CloseIcon className="text-[#62748E] w-[14px] h-[14px]" />
                    </Button>
                  </>
                ) : (
                  <span
                    onClick={() =>
                      handleEditClick(
                        'phone_number',
                        userinfoData?.customer?.phone_number || ''
                      )
                    }
                    className="text-sm tracking-widest text-[#BB742F] duration-150 transition-colors cursor-pointer"
                  >
                    {t('Edit')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex  px-6 py-3  border-solid border-0 border-b border-[#F1F5F9]">
              <div className="group flex-1 flex items-center py-2 no-underline gap-3">
                <EmailOutlined className="text-[#90A1B9] text-base" />
                <span className="text-sm tracking-widest text-[#62748E] duration-150 transition-colors">
                  {t('Date of Birth')}
                </span>
              </div>
              <div
                className="group  flex items-center py-1 no-underline gap-3"
                style={{ flex: 2 }}
              >
                {editingField === 'date_of_birth' ? (
                  <Input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full text-sm tracking-widest text-[#101828] bg-[#FFF8F1] border border-[#BB742F] rounded px-2 py-2 outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm tracking-widest text-[#101828] duration-150 transition-colors">
                    {userinfoData?.customer?.date_of_birth || ''}
                  </span>
                )}
              </div>
              <div className="group  flex items-center  no-underline gap-1 justify-end">
                {editingField === 'date_of_birth' ? (
                  <>
                    <Button
                      onClick={handleSave}
                      className="w-[32px] h-[32px] bg-[#101828] rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity border-none ml-2"
                    >
                      <CheckIcon className="text-white w-[14px] h-[14px]" />
                    </Button>
                    <Button
                      onClick={handleCancel}
                      className="w-[32px] h-[32px] bg-[#F1F5F9] rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity ml-2 border-none"
                    >
                      <CloseIcon className="text-[#62748E] w-[14px] h-[14px]" />
                    </Button>
                  </>
                ) : (
                  <span
                    onClick={() =>
                      handleEditClick(
                        'date_of_birth',
                        userinfoData?.customer?.date_of_birth || ''
                      )
                    }
                    className="text-sm tracking-widest text-[#BB742F] duration-150 transition-colors cursor-pointer"
                  >
                    {t('Edit')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Grid>
      </Grid>

      <Grid container sx={{ ...commonStyles }}>
        <Grid
          className="relative flex items-center justify-between px-4 py-2"
          item
          sx={{ flexGrow: 1 }}
        >
          <Typography variant="h4" component="div" className="font-semibold">
            {t('Profile')}111
          </Typography>
          <EditIcon
            onClick={() => handleClick(true)}
            className="border border-solid flex items-center cursor-pointer bottom-0 p-0.5 rounded-sm hover:text-brand"
          />
        </Grid>

        <Grid
          className="grid"
          container
          sx={{
            px: 3,
            py: 1,
            borderTop: '1px solid',
            borderColor: 'themeAdditional.borderColor',
          }}
        >
          <Grid className="grid grid-cols-2" sx={{ py: 1 }}>
            <Typography variant="body1">{t('First name')}</Typography>

            <Typography variant="body1">
              {userinfoData?.customer?.firstname || ''}
            </Typography>
          </Grid>
          <Grid className="grid grid-cols-2" sx={{ py: 1 }}>
            <Typography variant="body1">{t('Last Name')}</Typography>

            <Typography variant="body1">
              {userinfoData?.customer?.lastname || ''}
            </Typography>
          </Grid>

          <Grid className="grid grid-cols-2" sx={{ py: 1 }}>
            <Typography variant="body1">{t('Email')}</Typography>

            <Typography className="break-all" variant="body1">
              {userinfoData?.customer?.email || ''}
            </Typography>
          </Grid>
          <Grid className="grid grid-cols-2" sx={{ py: 1 }}>
            <Typography variant="body1">{t('Password')}</Typography>

            <Typography variant="body1"> ************</Typography>
          </Grid>
        </Grid>
      </Grid>
    </ErrorBoundary>
  );
};
export default ProfileInfo;
