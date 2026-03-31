import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
const EditIcon = dynamic(() => import('@mui/icons-material/Edit'));

const commonStyles = {
  bgcolor: 'background.paper',
  border: 1,
  borderRadius: 1,
  borderColor: 'themeAdditional.borderColor',
};
type userinfoDataType = {
  userinfoData: {
    customer: {
      firstname: string;
      lastname: string;
      email: string;
    };
  };
  handleClick: Function;
};
const ProfileInfo = ({ userinfoData, handleClick }: userinfoDataType) => {
  const { t } = useTranslation('common');

  return (
    <ErrorBoundary>
      <Grid container sx={{ ...commonStyles }}>
        <Grid
          className="relative flex items-center justify-between px-4 py-2"
          item
          sx={{ flexGrow: 1 }}
        >
          <Typography variant="h4" component="div" className="font-semibold">
            {t('Profile')}
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
