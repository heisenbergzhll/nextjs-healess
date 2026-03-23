import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { PlaceHolder } from '@voguish/module-customer/Components/OverviewTab/PlaceHolder';
import { useCustomerQuery } from '@voguish/module-customer/hooks/useCustomerQuery';

import GET_CUSTOMER from '@voguish/module-customer/graphql/Customer.graphql';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Sidebar from '../Layout/Sidebar';

const OverviewData = dynamic(() => import('./OverviewData'));
const EditProfile = dynamic(() => import('./EditProfile'));
const TabButton = dynamic(() => import('./TabButton'));
const CreateIcon = dynamic(() => import('@mui/icons-material/Create'));

const UserInfo = () => {
  const [overView, setOverview] = useState<boolean>(true);
  const { data, loading /*, error */ } = useCustomerQuery(GET_CUSTOMER);

  /**
   * Code for set the input value in edit form
   */

  const handleClick = () => {
    overView ? setOverview(false) : setOverview(true);
  };
  const commonStyles = {
    bgcolor: 'background.paper',
    border: 1,
    borderRadius: 1,
    borderColor: 'themeAdditional.borderColor',
  };
  return (
    <Sidebar>
      {loading ? (
        <PlaceHolder />
      ) : (
        <Grid container>
          <Grid item xs={12}>
            {overView && overView ? (
              <ErrorBoundary>
                <Box component="div" sx={{ ...commonStyles }}>
                  <span className="relative w-full">
                    <CreateIcon
                      onClick={handleClick}
                      className="absolute border border-solid cursor-pointer rtl:left-1 ltr:right-1 top-1 p-0.5 rounded-sm hover:text-brand"
                    />
                    <OverviewData data={data} />
                  </span>
                </Box>
                <TabButton />
              </ErrorBoundary>
            ) : (
              <EditProfile
                formData={data?.customer}
                handleClick={handleClick}
              />
            )}
          </Grid>
        </Grid>
      )}
    </Sidebar>
  );
};

export default UserInfo;
