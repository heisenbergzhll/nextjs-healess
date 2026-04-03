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
        <header className="w-full bg-white shadow-lg">
          <nav
            aria-label="Top"
            className="px-4 mx-auto sm:px-6 max-w-[125rem] lg:px-8"
          >
            <div className="flex items-center justify-between w-full h-16 gap-4 mx-auto -3xs:gap-1.5">
              <span className="sr-only lg:hidden">open sidebar</span>
              <div ref={node} className="lg:hidden">
                <div className="relative flex items-center cursor-pointer max-w-fit max-h-fit">
                  <Burger open={open} setOpen={setOpen} />
                </div>
                <SideBar
                  openSidebar={open}
                  setOpenSidebar={setOpen}
                  sortedMenu={sortedMenu}
                />
              </div>
              <div aria-label="voguish">
                {baseUrl && (
                  <Link href="/" aria-label="Go to search" passHref>
                    <Image
                      decoding="auto"
                      priority={true}
                      src={baseUrl ? `${baseUrl}media/logo/${logoUrl}` : ''}
                      alt={storeData?.logo_alt || 'voguish'}
                      height={28}
                      width={88}
                    />
                  </Link>
                )}
              </div>
              {/* Flyout menus */}
              <MegaMenu menuItems={sortedMenu} activeMenus={activeMenus} />
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
          </nav>
        </header>
      </div>
    </ErrorBoundary>
  );
};
export default Header;
