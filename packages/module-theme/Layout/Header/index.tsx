import { STORE_CONFIG, getLocalStorage } from '@store/local-storage';
import { BRAND_HEX_CODE } from '@utils/Constants';
import MenuHelper from '@utils/Menu';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Burger } from './HamburgerMenu';
import { useInfo } from './Provider/InfoProvider';

const NextNProgress = dynamic(() => import('nextjs-progressbar'));
const SideBar = dynamic(() => import('./SideBar'));
const Search = dynamic(() => import('./Search'));

const StoreSwitcher = dynamic(
  () => import('@voguish/module-store/StoreSwitcher')
);

const HeaderIcons = dynamic(() => import('./HeaderIcons'), {
  loading: () => (
    <div className="flex items-center w-full gap-x-2">
      <div className="w-8 h-8 rounded-full aspect-square lg:w-9 lg:h-9" />
      <div className="w-8 h-8 rounded-full aspect-square lg:w-12 lg:rounded-md lg:h-9" />
      <div className="w-8 h-8 rounded-full aspect-square lg:w-9 lg:h-9" />
      <div className="w-8 h-8 rounded-full aspect-square lg:w-9 lg:h-9" />
    </div>
  ),
});
const MegaMenu = dynamic(() => import('./Megamenu'));

const Header = ({ isAccountLoggedIn }: { isAccountLoggedIn: boolean }) => {
  const [activeMenuPath, setActiveMenuPath] = useState<string>('/');
  const { data } = useInfo();
  const {
    query: { urlKey = '/' },
  } = useRouter();

  useEffect(() => {
    if (data?.megaMenu) {
      const menu = data.megaMenu;
      const activeMenu = menu.find((menu) => urlKey === menu.url_key);
      const path =
        activeMenu?.path && activeMenu.path !== '/'
          ? activeMenu.path.slice(4)
          : '';
      setActiveMenuPath(path);
    }
  }, [urlKey, data]);

  let profileUrl = '/customer/account/login';
  if (isAccountLoggedIn) {
    profileUrl = '/customer/account/';
  }
  const sortedMenu = MenuHelper.reduce(data?.megaMenu || []);
  const storeData = getLocalStorage(STORE_CONFIG, true) || {};
  const baseUrl = storeData?.base_url;
  const logoUrl = storeData?.header_logo_src;
  const activeMenus = activeMenuPath.split('/');
  const [open, setOpen] = useState(false);
  const node = useRef<any>();

  return (
    <ErrorBoundary>
      <NextNProgress
        options={{ showSpinner: false }}
        color={BRAND_HEX_CODE}
        showOnShallow={true}
      />
      <div
        aria-label="navigation-menu"
        className="fixed top-0 z-[999] w-full bg-white"
      >
        {/* Mobile menu */}
        <header className="w-full bg-white">
          <div className="w-full bg-white border-solid border-0 border-b border-slate-200">
            <nav
              aria-label="Top"
              className="px-4 lg:px-[6.625rem] mx-auto  max-w-[90rem]"
            >
              <div className="flex items-center justify-between w-full h-20 gap-4 mx-auto -3xs:gap-1.5">
                <span className="sr-only lg:hidden">open sidebar</span>
                <div ref={node} className="lg:hidden mr-2">
                  <div className="relative flex items-center cursor-pointer max-w-fit max-h-fit">
                    <Burger open={open} setOpen={setOpen} />
                  </div>
                  <SideBar
                    openSidebar={open}
                    setOpenSidebar={setOpen}
                    sortedMenu={sortedMenu}
                  />
                </div>
                <div aria-label="unineed">
                  <Link href="/" aria-label="Go to search" passHref>
                    <Image
                      decoding="auto"
                      priority={true}
                      src="/assets/img/logo.svg"
                      alt={storeData?.logo_alt || 'unineed'}
                      height={21}
                      width={186}
                    />
                  </Link>
                </div>
                <div className="-lg:hidden">
                  <StoreSwitcher />
                </div>
                <div className="-lg:hidden flex-1 min-w-0">
                  <Search />
                </div>
                <div
                  aria-label="header-icons"
                  className="flex items-center rtl:mr-auto ltr:ml-auto"
                >
                  <HeaderIcons
                    isAccountLoggedIn={isAccountLoggedIn}
                    profileUrl={profileUrl}
                  />
                </div>
              </div>
              <div className="lg:hidden pb-4">
                <Search />
              </div>
            </nav>
          </div>
          <div className="w-full hidden lg:block bg-white border-solid border-0 border-b border-slate-200">
            <nav className="px-[6.625rem] mx-auto sm:px-6 max-w-[90rem] lg:px-[6.625rem]">
              <MegaMenu menuItems={sortedMenu} activeMenus={activeMenus} />
            </nav>
          </div>
        </header>
      </div>
    </ErrorBoundary>
  );
};
export default Header;
