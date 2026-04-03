import { Suspense } from 'react';
import dynamic from 'next/dynamic';

import { PageOptions } from '@voguish/module-theme/page';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { UserProfilePlaceHolder } from '@voguish/module-customer/Components/OverviewTab/PlaceHolder';
import Containers from '@voguish/module-theme/components/ui/Container';

const UserInfo = dynamic(
  () => import('@voguish/module-customer/Components/OverviewTab/UserInfo'),
  {
    loading: () => (
      <Containers>
        <UserProfilePlaceHolder />
      </Containers>
    ),
    ssr: false,
  }
);

const OverView = () => {
  return (
    <Suspense
      fallback={
        <Containers>
          <UserProfilePlaceHolder />
        </Containers>
      }
    >
      <UserInfo />
    </Suspense>
  );
};

export default OverView;
export const getServerSideProps = async ({ locale }: { locale: string }) => {
  const pageProps: PageOptions = {
    title: 'Account Overview - Voguish ',
    description: 'Welcome to Voguish customer account',
  };
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      pageOptions: pageProps,
    },
  };
};
