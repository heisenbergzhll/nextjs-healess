import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { RootState } from '@store';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  CART_DATA,
  STORE_CONFIG,
  getKeyFromStorage,
} from '@store/local-storage';
import { setCartOpen } from '@store/store';
import { useToken } from '@voguish/module-customer/hooks/useToken';
import Cart from '@voguish/module-quote/Components/Cart/Cart';
import CurrencySwitcher from '@voguish/module-store/CurrencySwitcher';
import {
  IconAccount,
  IconBag,
  IconSearch,
  IconSell,
  IconWhishList,
} from '@voguish/module-theme/components/elements/Icon';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export interface HeaderTypes {
  profileUrl: string;
  isAccountLoggedIn: boolean;
}
const HeaderIcons = ({ profileUrl, isAccountLoggedIn }: HeaderTypes) => {
  const router = useRouter();
  const { locale } = router;
  const cartOpen = useAppSelector(
    (state) => state?.storeConfig?.setOpenCart
  ) as boolean;
  const [isOpen, setIsOpen] = useState({ right: cartOpen, left: false });

  const dispatch = useAppDispatch();
  const toggleCart = (open: boolean | undefined) => () => {
    if (locale === 'ar') {
      setIsOpen({ ...isOpen, left: open as boolean });
    } else {
      setIsOpen({ ...isOpen, right: open as boolean });
    }

    dispatch(setCartOpen(open));
  };
  useEffect(() => {
    isOpen;
  }, [isOpen]);
  const openCartValue = cartOpen ? { right: cartOpen } : isOpen;
  const requiredKey = 'marketplace_is_active';
  const storeData = getKeyFromStorage(STORE_CONFIG, requiredKey) || false;
  const token = useToken() || isAccountLoggedIn;
  const quote = useAppSelector(
    (state: RootState) => state?.cart?.quote || null
  );
  const itemCount =
    quote?.total_quantity || getKeyFromStorage(CART_DATA, 'total_quantity');
  return (
    <ErrorBoundary>
      <div className="flex items-center justify-center gap-x-2 md:gap-x-3 xl:gap-x-4">
        {storeData && (
          <Link aria-label="Got to marketplace" href="/marketplace">
            <button
              aria-label="Go to marketplace"
              className="relative flex items-center justify-center p-0 bg-transparent border-none outline-none cursor-pointer group h-7 w-7 hover:text-brand focus:ring-primary/5 md:h-8 md:w-8"
            >
              <IconSell hover="stroke-black group-hover:stroke-brand duration-150" />
            </button>
          </Link>
        )}

        <Link
          aria-label="Go to wishlist"
          href={token ? '/customer/compare' : '/customer/account/login'}
        >
          <button
            aria-label="open compare list"
            className="relative flex items-center justify-center p-0 bg-transparent border-none outline-none cursor-pointer group h-7 w-7 hover:text-brand focus:ring-primary/5 md:h-8 md:w-8"
          >
            <CompareArrowsIcon className="text-3xl text-black duration-150 group-hover:text-brand md:text-4xl" />
          </button>
        </Link>

        <Link
          prefetch
          aria-label="Go to search"
          href="/catalogsearch"
          className="no-underline"
        >
          <button
            aria-label="Search"
            className="relative flex items-center justify-center p-0 bg-transparent border-none outline-none cursor-pointer group h-7 w-7 hover:text-brand focus:ring-primary/5 md:h-8 md:w-8"
          >
            <IconSearch hover="fill-black group-hover:fill-brand duration-150" />
          </button>
        </Link>
        <div className="relative flex items-center justify-center p-0 border-none outline-none cursor-pointer bg-t justify-centerransparent h-7 w-7 hover:text-brand focus:ring-primary/5 md:h-8 md:w-8 -lg:hidden">
          <CurrencySwitcher />
        </div>
        <Link aria-label="Go to account" href={profileUrl}>
          <button
            aria-label="Go to account"
            className="relative flex items-center justify-center p-0 bg-transparent border-none outline-none cursor-pointer group h-7 w-7 hover:text-brand focus:ring-primary/5 md:h-8 md:w-8"
          >
            <IconAccount hover="stroke-black group-hover:stroke-brand duration-150" />
          </button>
        </Link>

        <Link
          aria-label="Go to wishlist"
          href={token ? '/wishlist' : '/customer/account/login'}
        >
          <button
            aria-label="open wishlist"
            className="relative flex items-center justify-center p-0 bg-transparent border-none outline-none cursor-pointer group h-7 w-7 hover:text-brand focus:ring-primary/5 md:h-8 md:w-8 -lg:hidden"
          >
            <IconWhishList hover="stroke-black group-hover:stroke-brand duration-150" />
          </button>
        </Link>

        <button
          aria-describedby="cart open"
          aria-label={`Cart contains ${itemCount} items open to view them`}
          onClick={toggleCart(true)}
          className="relative flex items-center justify-center p-0 -mt-1 bg-transparent border-none outline-none cursor-pointer -bottom-1 h-7 w-7 hover:text-brand focus:ring-primary/5 md:h-8 md:w-8"
        >
          <p className="sr-only">Cart Open</p>
          <IconBag />

          {itemCount > 0 && (
            <span
              aria-label="Cart Count"
              className="absolute -right-[5px] -top-[5px] rounded-full bg-brand px-2 py-0.5 text-xs text-green-100"
            >
              {itemCount}
            </span>
          )}
        </button>
        {cartOpen && !isOpen ? (
          ''
        ) : (
          <Cart toggleDrawer={toggleCart} cartOpen={openCartValue} />
        )}
      </div>
    </ErrorBoundary>
  );
};
export default HeaderIcons;
