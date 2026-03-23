import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Typography from '@mui/material/Typography';
import { useAppDispatch } from '@store/hooks';
import {
  SELECTED_STORE,
  STORE_CODE,
  STORE_CONFIG,
  getKeyFromStorage,
  getLocalStorage,
} from '@store/local-storage';
import { setCurrentStore } from '@store/store';
import { STORE_LIST } from '@utils/Constants';
import { isValidArray } from '@utils/Helper';
import Thumbnail from '@voguish/module-catalog/Components/Product/Item/Thumbnail';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { setCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function StoreSwitcher({
  isSidebar = false,
}: {
  isSidebar?: boolean;
}) {
  const data = useSelector((state) => state);
  // const { data: stores, loading } =
  //   useQuery<StoreConfigQueryResult>(AVAILABLE_STORES);

  // console.log('stores --- stores', stores)
  const dispatch = useAppDispatch();

  const defaultStore = getKeyFromStorage(STORE_CONFIG, 'store_code');

  const currentStoreCode = getLocalStorage(STORE_CODE) ?? getKeyFromStorage(STORE_CONFIG, 'store_code');

  const storeCodeItem = currentStoreCode
    ? currentStoreCode
    : defaultStore || 'default';

  const router = useRouter();
  const { pathname, asPath, query, locale } = router;

  const storeEvent: any = STORE_LIST.find(
    (store: any) => store.locale === locale && store.locale
  );
  const [code, setCode] = useState(storeEvent);
  const manageStore = () => {
    dispatch(setCurrentStore(storeCodeItem));
    if (!isSidebar) {
      storeCodeItem !== 'undefined' && router.reload();
    }
    setCookie(SELECTED_STORE, storeCodeItem);
  };
  useEffect(() => {
    dispatch(setCurrentStore(storeCodeItem));
    // router.push({ pathname, query }, asPath, {
    //   locale:
    //     storeCodeItem !== 'default'
    //       ? storeCodeItem?.split('_')[0]
    //       : process.env.DEFAULT_LOCALE,
    // });
    // manageStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, storeCodeItem]);

  const handleChangeList = (event: string) => {
    console.log('envent', event);
    return;
  };

  return (
    <ErrorBoundary>
      {
        isValidArray(STORE_LIST) && (
          <Listbox value={code} onChange={handleChangeList}>
            {({ open }) => (
              <div className="relative mt-1">
                <ErrorBoundary>
                  <ListboxButton className="-lg:w-full -lg:py-2 relative -mx-0.5 -mt-1 flex cursor-pointer items-center justify-center border-0 bg-transparent px-0 text-[27px] font-light">
                    <div className="-lg:w-full block truncate cursor-pointer">
                      {STORE_LIST
                        ?.filter((store: any) => store?.locale === locale)
                        .map((store: any, index: number) => (
                          <div
                            className="-lg:w-full flex items-center justify-between"
                            key={store?.store_code + index}
                          >
                            <span className="flex items-center px-1.5 text-xl duration-300 hover:border-brand">
                              <span className="relative w-8 h-4 py-0 text-2xl truncate border-2 border-solid  lg:border-transparent">
                                <Thumbnail
                                  decoding="auto"
                                  fill
                                  className="object-cover scale-110 rounded-md"
                                  thumbnail={`/assets/icons/${store?.locale}.svg`}
                                  alt={store?.locale}
                                />
                              </span>
                              <span className="px-2 text-sm font-normal text-black">
                                {`${store?.store_name}`}
                              </span>
                            </span>
                            <motion.div
                              className="relative py-0 max-h-4 "
                              initial={{ rotate: 0 }}
                              animate={{
                                rotate: open ? 180 : 0,
                              }}
                              transition={{ duration: 0.4 }}
                            >
                              <KeyboardArrowDownIcon className="py-0 lg:text-black" />
                            </motion.div>
                          </div>
                        ))}
                    </div>
                  </ListboxButton>
                </ErrorBoundary>

                <Transition
                  as={Fragment}
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  enter="transition ease-in duration-300"
                  leave="transition ease-in duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute z-50 mb-2 mt-1 translate-x-1.5 list-none flex flex-col focus:outline-none sm:text-sm">
                    <div
                      className="-lg:hidden absolute -top-1.5 left-1/2 -translate-x-1/2 z-20"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '8px solid #fff',
                      }}
                      aria-hidden
                    />
                    <div
                      className="-lg:hidden absolute -top-2 left-1/2 -translate-x-1/2 z-10"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '8px solid rgb(16 24 40 / 0.05)',
                      }}
                      aria-hidden
                    />
                    <div className="max-h-[20rem] overflow-auto rounded-md bg-white text-base shadow-xl ring-1 ring-black/5">
                      <ListboxOptions className="gap-2">
                        <Typography variant='body1' className='px-4 pt-3 py-2 text-center'>Select Country</Typography>
                        {STORE_LIST?.map((store: any) => (
                          <ListboxOption
                            key={store?.store_code}
                            value={store?.store_code}
                            className={({ active }) =>
                              `relative cursor-pointer py-3 px-6 select-none text-black hover:bg-[#d9d9d9]/10 ${storeCodeItem === store?.store_code ? 'bg-[#d9d9d9]/20' : 'bg-white'}`
                            }
                          >
                            <ErrorBoundary>
                              <span
                                className={`text-sm cursor-pointer flex items-center gap-2 truncate`}
                              >
                                <span className="relative hover:text-black w-12 h-6 py-0 text-2xl truncate border border-white border-solid">
                                  <Thumbnail
                                    decoding="auto"
                                    fill
                                    className="object-cover scale-110 rounded-md"
                                    thumbnail={`/assets/icons/${store?.locale}.svg`}
                                    alt={store?.locale}
                                  />
                                </span>
                                <span className={`flex font-light items-center hover:font-normal w-full min-w-[215px]}`}>
                                  <span className={`${storeCodeItem === store?.store_code ? 'font-normal' : 'font-light'}`}>
                                    {`${store?.store_name} (${store?.locale.toUpperCase()})`}
                                  </span>
                                  {storeCodeItem === store?.store_code && (
                                    <CheckIcon className="-mt-2 text-black ltr:ml-6 rtl:mr-6" />
                                  )}
                                </span>
                              </span>
                            </ErrorBoundary>
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </div>

                </Transition>
              </div>
            )}
          </Listbox>
        )
      }
    </ErrorBoundary>
  );
}
