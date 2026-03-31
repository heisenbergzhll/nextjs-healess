import { useQuery } from '@apollo/client';
import { Listbox, Transition } from '@headlessui/react';
import { client, httpLink, setStoreCode } from '@lib/apollo-client';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAppDispatch } from '@store/hooks';
import {
  SELECTED_STORE,
  STORE_CODE,
  STORE_CONFIG,
  getKeyFromStorage,
  getLocalStorage,
} from '@store/local-storage';
import { setCurrentStore } from '@store/store';
import { isValidArray } from '@utils/Helper';
import Thumbnail from '@voguish/module-catalog/Components/Product/Item/Thumbnail';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { setCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AVAILABLE_STORES from './graphql/AvailableStore.graphql';
import { StoreConfigQueryResult } from './types';

export default function StoreSwitcher({
  isSidebar = false,
}: {
  isSidebar?: boolean;
}) {
  const data = useSelector((state) => state);
  const { data: stores, loading } =
    useQuery<StoreConfigQueryResult>(AVAILABLE_STORES);
  const dispatch = useAppDispatch();
  const defaultStore = getKeyFromStorage(STORE_CONFIG, 'locale');
  const currentStoreCode =
    getLocalStorage(STORE_CODE) ??
    getKeyFromStorage(STORE_CONFIG, 'store_code');
  const storeCodeItem = currentStoreCode
    ? currentStoreCode
    : defaultStore?.split('_')[0] || '';
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;
  const storeEvent = stores?.availableStores?.find(
    (store: any) => store?.locale.split('_')[0] === locale && store.locale
  );

  const [code, setCode] = useState(storeEvent);
  const manageStore = () => {
    if (!loading) {
      dispatch(setCurrentStore(storeCodeItem));
      if (!isSidebar) {
        storeCodeItem !== 'undefined' && router.reload();
      }
      setCookie(SELECTED_STORE, storeCodeItem);
    }
  };

  useEffect(() => {
    dispatch(setCurrentStore(storeCodeItem));
    router.push({ pathname, query }, asPath, {
      locale:
        storeCodeItem !== 'default'
          ? storeCodeItem?.split('_')[0]
          : process.env.DEFAULT_LOCALE,
    });
    manageStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, storeCodeItem]);

  const handleChangeList = (event: string) => {
    if (event.split('_')[0] === locale) {
      return;
    }
    console.log(event, 'event changer write now ', event.split('_')[0]);
    if (!loading) {
      client.setLink(setStoreCode(event.split('_')[0] || '').concat(httpLink));
      dispatch(setCurrentStore(event.split('_')[0]));
      setCode(event);
    }
  };

  return (
    <ErrorBoundary>
      {loading ? (
        <div className="rounded-full size-10 animate-pulse bg-slate-500" />
      ) : (
        isValidArray(stores?.availableStores) && (
          <Listbox value={code} onChange={handleChangeList}>
            {({ open }) => (
              <div className="relative mt-1">
                <ErrorBoundary>
                  <Listbox.Button className="relative -mx-0.5 -mt-1 flex cursor-pointer items-center justify-center border-0 bg-transparent px-0 text-[27px] font-light">
                    <div className="block truncate cursor-pointer">
                      {stores?.availableStores
                        ?.filter(
                          (store: any) => store?.locale.split('_')[0] === locale
                        )
                        .map((store: any, index: number) => (
                          <div
                            className="flex items-center justify-between"
                            key={store?.store_code + index}
                          >
                            <span className="flex items-center px-1.5 text-xl duration-300 hover:border-brand">
                              <span className="relative w-10 h-6 py-0 text-2xl truncate border-2 border-solid rounded-md lg:border-transparent">
                                <Thumbnail
                                  decoding="auto"
                                  fill
                                  className="object-cover scale-110 rounded-md"
                                  thumbnail={`https://flagcdn.com/32x24/${
                                    store?.locale?.split('_')[0] !== 'en'
                                      ? store?.locale?.split('_')[0]
                                      : 'us'
                                  }.png`}
                                  alt={store?.locale}
                                />
                              </span>
                              <span className="px-2 text-sm font-normal text-white -lg:hidden">
                                {store?.locale?.split('_')[0] === 'en'
                                  ? 'English (USA)'
                                  : store?.store_name}
                              </span>
                            </span>
                            <motion.div
                              className="relative py-0 max-h-4 "
                              initial={{ rotate: 0, marginTop: -13 }}
                              animate={{
                                rotate: open ? 180 : 0,
                                marginTop: open ? 10 : -8,
                              }}
                              transition={{ duration: 0.4 }}
                            >
                              <KeyboardArrowDownIcon className="py-0 lg:text-white" />
                            </motion.div>
                          </div>
                        ))}
                    </div>
                  </Listbox.Button>
                </ErrorBoundary>

                <Transition
                  as={Fragment}
                  enter="transition ease-in duration-200"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute bottom-full mb-2 mt-1 flex max-h-[12.3rem] translate-x-1.5 list-none flex-col gap-2 overflow-auto rounded-md bg-white p-4 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm lg:w-[13rem]">
                    {stores?.availableStores?.map((store: any) => (
                      <Listbox.Option
                        key={store?.store_code}
                        value={store?.locale}
                        className={({ active }) =>
                          `relative cursor-pointer py-0 select-none ${
                            active ? 'text-white' : 'text-gray-900'
                          }`
                        }
                      >
                        <ErrorBoundary>
                          <span
                            className={`text-sm cursor-pointer flex items-center gap-2 truncate ${
                              storeCodeItem === store?.store_code
                                ? 'text-brand'
                                : 'font-normal'
                            }`}
                          >
                            <span className="relative hover:text-black w-12 h-6 py-0 text-2xl truncate border border-white border-solid rounded-md">
                              <Thumbnail
                                decoding="auto"
                                fill
                                className="object-cover scale-110 rounded-md"
                                thumbnail={`https://flagcdn.com/32x24/${
                                  store?.locale?.split('_')[0] !== 'en'
                                    ? store?.locale?.split('_')[0]
                                    : 'us'
                                }.png`}
                                alt={store?.locale}
                              />
                            </span>
                            <span className="flex items-center hover:text-black w-full">
                              <span className="-lg:hidden">
                                {store?.locale?.split('_')[0] === 'en'
                                  ? 'English (USA)'
                                  : store?.store_name}
                              </span>
                              {storeCodeItem === store?.store_code && (
                                <CheckIcon className="-mt-2 text-white ltr:ml-6 rtl:mr-6" />
                              )}
                            </span>
                          </span>
                        </ErrorBoundary>
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            )}
          </Listbox>
        )
      )}
    </ErrorBoundary>
  );
}
