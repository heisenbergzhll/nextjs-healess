import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { AUTHORIZED } from '@utils/Constants';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Containers from '@voguish/module-theme/components/ui/Container';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { Logout } from 'store';
import { Avatar } from '~node_modules/@mui/material';
import {
  AccountIcon,
  AddressIcon,
  LogoutIcon,
  OrderIcon,
  WishIcon,
} from '~packages/module-theme/components/elements/Icon';
import { stringAvatar } from '~utils/Helper';

const Sidebar = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();

  const router = useRouter();
  const tabs = [
    // {
    //   id: 0,
    //   name: t('Overview'),
    //   route: '/customer/account',
    //   icon: AccountIcon,
    // },
    {
      id: 2,
      name: t('My Profile'),
      route: '/customer/account/profile',
      icon: AccountIcon,
    },
    {
      id: 1,
      name: t('My Orders'),
      route: '/sales/order/history',
      icon: OrderIcon,
    },

    {
      id: 3,
      name: t('My Address'),
      route: '/customer/account/address',
      icon: AddressIcon,
    },
    {
      id: 4,
      name: t('My Wishlist'),
      route: '/wishlist',
      icon: WishIcon,
    },
  ];

  status !== AUTHORIZED && router.push('/customer/account/login');

  return (
    <ErrorBoundary>
      <Containers className="max-w-[90rem]  lg:px-[6.625rem] -mt-2 ">
        <div className="grid gap-y-4 md:grid-cols-12 ">
          <Grid
            item
            className="w-full md:w-[17.375rem] md:col-span-4 md:rtl:order-2 lg:col-span-3 box-border border border-solid border-[#E2E8F0] rounded-2xl lg:h-[24.3125rem]"
            // sx={{ pr: { md: 2 } }}
          >
            <Grid container sx={{ mb: 1 }}>
              <Grid item sx={{ flexGrow: 1 }}>
                {/* <Typography variant="h2">{t('User Profile')}</Typography> */}
                <div className="flex border-solid border-0 border-b border-[#E2E8F0] gap-3  p-3 lg:p-6">
                  <Avatar
                    {...stringAvatar(session?.user?.firstname ?? 'U')}
                    className="w-[48px] h-[48px] bg-brand uppercase font-medium"
                  />
                  <div className="gap-y-2">
                    <p className="font-medium text-black">
                      {session?.user?.firstname} {session?.user?.lastname}
                    </p>
                    <p className="text-sm text-[#62748E]">
                      {session?.user.email}
                    </p>
                  </div>
                </div>
              </Grid>
            </Grid>
            <Grid container>
              {tabs.map((items, index) => (
                <Grid
                  key={items.id}
                  component={Link}
                  href={items.route}
                  xs={12}
                  // className={index === 3 ? 'py-4' : ''}
                  sx={{
                    maxWidth: '100% !important',
                    borderRight: '3px solid #fff',
                    fontWeight: 300,
                    // borderRadius: 1,
                    borderColor:
                      router.pathname === items.route ? '#BB742F' : '#fff',
                    color:
                      router.pathname === items.route ? '#BB742F' : '#45556C',
                    background:
                      router.pathname === items.route ? '#F8F8F8' : '',
                    // mb: 1,
                    p: 2,
                    '&:hover': {
                      borderColor: '#BB742F',
                      color: '#BB742F',
                      background: '#F8F8F8',
                      svg: {
                        color: '#BB742F',
                      },
                    },
                  }}
                  item
                >
                  <div className="group w-full flex items-center px-6  no-underline gap-3">
                    <items.icon
                      className={`transition-colors duration-150 ${
                        router.pathname === items.route
                          ? 'text-[#BB742F]'
                          : 'text-[#90A1B9] '
                      }`}
                    />
                    <Typography variant="body1">{items.name}</Typography>
                  </div>
                </Grid>
              ))}
              <Grid
                item
                className="w-full hidden px-3  md:flex border-solid border-0 border-t border-[#E2E8F0] cursor-pointer"
              >
                {/* <Button
                  className="w-32 rounded-[unset] border border-solid border-darkGreyBackground py-2 text-darkGreyBackground duration-200 hover:border-brand"
                  variant="outlined"
                  onClick={Logout}
                >
                  {t('Sign out')}
                </Button> */}
                <div
                  className=" w-full flex  px-6 py-4 gap-3 "
                  onClick={() => {
                    close();
                    Logout();
                  }}
                >
                  <LogoutIcon />
                  <span className="text-sm tracking-widest text-[#FB2C36]">
                    Logout
                  </span>
                </div>
              </Grid>
              {/* <div
                className=" w-full flex  px-6 py-4 gap-3 border-solid border-0 border-t border-[#E2E8F0]"
                onClick={() => {
                  close();
                  Logout();
                }}
              >
                <LogoutIcon />
                <span className="text-sm tracking-widest text-[#FB2C36]">
                  Logout
                </span>
              </div> */}
            </Grid>
          </Grid>
          <ErrorBoundary>
            <Grid
              className="w-full md:col-span-8 md:px-6 md:rtl:order-1 lg:col-span-9"
              item
              sx={
                {
                  // borderLeft: { md: 2.5 },
                  // borderColor: { md: '#ececec' },
                }
              }
            >
              {children}
            </Grid>
          </ErrorBoundary>

          <Grid item className="flex my-6 md:hidden">
            <Button
              className="w-full rounded-[unset] border border-solid border-darkGreyBackground py-4 text-darkGreyBackground duration-200 hover:border-brand"
              variant="outlined"
              onClick={Logout}
            >
              {t('Sign out')}
            </Button>
          </Grid>
        </div>
      </Containers>
    </ErrorBoundary>
  );
};
export default Sidebar;
