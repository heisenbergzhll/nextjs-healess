import { PageOptions } from '@voguish/module-theme/page';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Containers from '@voguish/module-theme/components/ui/Container';
import { AuthPlaceholder } from '@packages/placeholder/ProductDetail';
import { Suspense } from 'react';

const Login = dynamic(
  () => import('@voguish/module-theme/pages/LoginAccount'),
  {
    loading: () => (
      <Containers>
        <AuthPlaceholder />
      </Containers>
    ),
    ssr: false,
  }
);

const LoginAccount = () => {
  return (
    <Suspense
      fallback={
        <Containers>
          <AuthPlaceholder />
        </Containers>
      }
    >
      <Login />
    </Suspense>
  );
};
export default LoginAccount;

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  const pageProps: PageOptions = {
    title: 'Customer Login',
    description: 'Welcome to Voguish Theme',
  };
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),

      pageOptions: pageProps,
    },
  };
};
