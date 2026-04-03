import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Containers from '@voguish/module-theme/components/ui/Container';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { Logout } from 'store';
import { AUTHORIZED } from '@utils/Constants';
import { useSession } from 'next-auth/react';

const Sidebar = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common');
  const { status } = useSession();

  const router = useRouter();
  const tabs = [
    { id: 0, name: t('Overview'), route: '/customer/account' },
    { id: 1, name: t('Orders'), route: '/sales/order/history' },
    { id: 2, name: t('Profile'), route: '/customer/account/profile' },
    { id: 3, name: t('Address'), route: '/customer/account/address' },
    {
      id: 4,
      name: t('Reset Password'),
      route: '/customer/account/reset-password',
    },
  ];

  status !== AUTHORIZED && router.push('/customer/account/login');
  return (
    <ErrorBoundary>
      <Containers className="-mt-2">
        <Grid container sx={{ mb: 3 }}>
          <Grid item sx={{ flexGrow: 1 }}>
            <Typography variant="h2">{t('User Profile')}</Typography>
          </Grid>
        </Grid>
        <div className="grid gap-y-4 md:grid-cols-12">
          <Grid
            item
            className="md:col-span-4 md:rtl:order-2 lg:col-span-3"
            sx={{ pr: { md: 2 } }}
          >
            <Grid container>
              {tabs.map((items) => (
                <Grid
                  key={items.id}
                  component={Link}
                  href={items.route}
                  xs={12}
                  sx={{
                    maxWidth: '100% !important',
                    borderRadius: 1,
                    borderColor:
                      router.pathname === items.route ? '#24ab85' : '#e0e0e0',
                    color: router.pathname === items.route ? '#24ab85' : '',
                    background:
                      router.pathname === items.route ? '#F8F8F8' : '',
                    mb: 1,
                    p: 2,
                    '&:hover': {
                      borderColor: '#24ab85',
                      color: '#24ab85',
                      background: '#F8F8F8',
                    },
                  }}
                  item
                >
                  <Typography variant="body1">{items.name}</Typography>
                </Grid>
              ))}
              <Grid item className="hidden mx-3 my-4 md:flex">
                <Button
                  className="w-32 rounded-[unset] border border-solid border-darkGreyBackground py-2 text-darkGreyBackground duration-200 hover:border-brand"
                  variant="outlined"
                  onClick={Logout}
                >
                  {t('Sign out')}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <ErrorBoundary>
            <Grid
              className="w-full md:col-span-8 md:px-6 md:rtl:order-1 lg:col-span-9"
              item
              sx={{
                borderLeft: { md: 2.5 },
                borderColor: { md: '#ececec' },
              }}
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
