'use client';

import { Drawer, IconButton, Button, Typography, Box } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Image from 'next/image';

import { useToken } from '@voguish/module-customer/hooks/useToken';
import StoreSwitcher from '@voguish/module-store/StoreSwitcher';
import CurrencySwitcher from '@voguish/module-store/CurrencySwitcher';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { isValidArray, isValidObject } from '@utils/Helper';
import { FormattedMenuItem } from './Megamenu/types';
import { getLocalStorage, STORE_CONFIG } from '@store/local-storage';
import { RootState } from '@store';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTranslation } from 'next-i18next';

type Props = {
  openSidebar: boolean;
  setOpenSidebar: (val: boolean) => void;
  sortedMenu: Record<string, FormattedMenuItem>;
};

type Category = {
  title: string;
  url_key: string;
  image_url: string;
  children?: Record<string, FormattedMenuItem>;
};

export default function SideBar({
  openSidebar,
  setOpenSidebar,
  sortedMenu,
}: Props) {
  const { t } = useTranslation('common');
  const token = useToken();
  const router = useRouter();
  const userName = useSelector((state: RootState) => state?.user?.name);

  const categories: Category[] = isValidObject(sortedMenu)
    ? Object.values(Object.values(sortedMenu)?.[0]?.children)
    : [];

  const storeData = getLocalStorage(STORE_CONFIG, true) || {};
  const baseUrl = storeData?.base_url;
  const logoUrl = storeData?.header_logo_src;

  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (openSidebar) {
      setOpenSidebar(false);
    }
  }, [router?.asPath]);
  function sortByNameAsc(items: any) {
    return [...(items || [])].sort((a, b) => b?.title?.localeCompare(a?.title));
  }
  return (
    <Drawer
      anchor="left"
      className="relative"
      open={openSidebar}
      onClose={() => setOpenSidebar(false)}
      PaperProps={{
        sx: {
          width: 340,
          borderRight: '1px solid #ddd',
          backgroundColor: '#fff',
        },
      }}
    >
      <ErrorBoundary>
        <Box className="flex justify-between items-center border-b border-gray-200 border-solid h-14 border-l-0 border-r-0 border-t-0 p-3 relative">
          <Link className="mt-1" href="/">
            <Image
              decoding="auto"
              priority={true}
              src={baseUrl ? `${baseUrl}media/logo/${logoUrl}` : ''}
              alt={storeData?.logo_alt || 'voguish'}
              height={28}
              width={88}
            />
          </Link>
          <IconButton
            onClick={() => setOpenSidebar(false)}
            sx={{ position: 'absolute', top: 7, right: 8 }}
            className="rtl:!left-1"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Back Button */}
        {selectedIndex !== -1 && (
          <Box className="flex items-center px-4 py-3 pb-1 border-b">
            <ChevronLeft onClick={() => setSelectedIndex(-1)} />
            <Typography
              variant="subtitle1"
              className="font-semibold"
              sx={{ ml: 1 }}
            >
              {t('All Categories')}
            </Typography>
          </Box>
        )}

        {/* Category List */}
        {selectedIndex === -1 && (
          <Box className="px-4 py-2 max-h-[65vh]">
            {isValidArray(categories) &&
              sortByNameAsc(categories)?.map(
                (category: any, idx) =>
                  isValidObject(category?.children) && (
                    <Box
                      key={category.title}
                      className="flex justify-between items-center py-2 cursor-pointer border-b"
                    >
                      <Typography>
                        <LinkItem
                          setOpenSidebar={setOpenSidebar}
                          page={category}
                        />
                      </Typography>
                      {isValidArray(
                        Object.values(
                          Object.values(categories[idx]?.children || {})
                        )
                      ) && (
                        <ChevronRightIcon
                          onClick={() => setSelectedIndex(idx)}
                        />
                      )}
                    </Box>
                  )
              )}
          </Box>
        )}

        {/* Subcategory Panel */}
        {selectedIndex >= 0 && (
          <Box className="px-4 py-2  max-h-[65vh] space-y-4">
            {isValidObject(categories[selectedIndex]?.children) &&
              sortByNameAsc(
                Object.values(
                  Object.values(categories[selectedIndex]?.children || {})
                )
              ).map((section) => (
                <div key={section.title}>
                  <LinkItem setOpenSidebar={setOpenSidebar} page={section} />
                  {isValidArray(Object.values(section?.children || {})) && (
                    <ul className="pl-4 space-y-2">
                      {sortByNameAsc(Object.values(section?.children)).map(
                        (item: any) => (
                          <li className="list-none h-8" key={item?.title}>
                            <LinkItem
                              setOpenSidebar={setOpenSidebar}
                              page={item}
                            />
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              ))}
          </Box>
        )}

        {/* Bottom Section */}
        {selectedIndex === -1 && (
          <Box className="mt-8 py-3 border-t absolute left-0 right-0 bottom-0 px-4 pt-6 space-y-4">
            {!token ? (
              <Box className="block gap-2">
                <Link href="/customer/account/login" className="w-full">
                  <Button fullWidth variant="outlined">
                    {t('Sign In')}
                  </Button>
                </Link>
                <br />
                <Link href="/customer/account/create" className="w-full !pt-2">
                  <Button fullWidth className="mt-3" variant="contained">
                    {t('Create Account')}
                  </Button>
                </Link>
              </Box>
            ) : (
              <Link
                href="/customer/account"
                className="flex justify-between items-center"
              >
                <div>
                  <Typography variant="body1">{t('Welcome')}</Typography>
                  <Typography variant="h6">{userName}</Typography>
                </div>
                <ArrowForwardIosIcon />
              </Link>
            )}

            <Box className="flex mt-2  justify-between items-center">
              <StoreSwitcher isSidebar={true} />
              <CurrencySwitcher />
              <Link
                href={token ? '/wishlist' : '/customer/account/login'}
                aria-label="Wishlist"
              >
                <FavoriteBorderIcon />
              </Link>
            </Box>
          </Box>
        )}
      </ErrorBoundary>
    </Drawer>
  );
}

type MenuItem = {
  setOpenSidebar: (val: boolean) => void;
  page: { url_key: string; title: string };
};

function LinkItem({ setOpenSidebar, page }: MenuItem) {
  const router = useRouter();
  return (
    <Link
      href={`/catalog/category/${page.url_key}`}
      onClick={() => setOpenSidebar(false)}
      className={`block w-full py-1 font-medium ${
        router.asPath === `/catalog/category/${page.url_key}`
          ? 'text-brand'
          : 'text-gray-900'
      }`}
    >
      <Typography variant="body2" className="capitalize font-medium">
        {page.title}
      </Typography>
    </Link>
  );
}
