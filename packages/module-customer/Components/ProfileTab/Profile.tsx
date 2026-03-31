import { ProfilePlaceholder } from '@voguish/module-customer/Components/ProfileTab/ProfilePlaceholder';
import GET_CUSTOMER from '@voguish/module-customer/graphql/Customer.graphql';
import { useCustomerQuery } from '@voguish/module-customer/hooks/useCustomerQuery';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Sidebar from '../Layout/Sidebar';
const EditForm = dynamic(() => import('./EditForm'));
const ProfileInfo = dynamic(() => import('./ProfileInfo'));
function Profile() {
  const [profileView, setProfile] = useState(false);
  const { data, loading /*, error */ } = useCustomerQuery(GET_CUSTOMER);
  return (
    <Sidebar>
      {loading ? (
        <ProfilePlaceholder />
      ) : !profileView ? (
        <ErrorBoundary>
          <ProfileInfo userinfoData={data} handleClick={setProfile} />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary>
          <EditForm userinfoData={data} handleClick={setProfile} />
        </ErrorBoundary>
      )}
    </Sidebar>
  );
}

export default Profile;
