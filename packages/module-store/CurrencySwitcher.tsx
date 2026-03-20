import { useQuery } from '@apollo/client';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { RootState } from '@store/index';
import {
  CURRENCY_RATES,
  getKeyFromStorage,
  getLocalStorage,
  setLocalStorage,
  STORE_CONFIG,
} from '@store/local-storage';
import { setCurrentCurrency } from '@store/store';
import { getValidCurrencies, IS_AUTO_CURRENCY_SET } from '@utils/Constants';
import { isValidArray } from '@utils/Helper';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Fragment, Key, useEffect, useState } from 'react';
import AVAILABLE_CURRENCY from './graphql/CurrencyRates.graphql';
function CurrencySwitcher({
  header = true,
  className,
}: {
  header?: boolean;
  className?: string;
}) {
  const defaultCurrencyCode = getKeyFromStorage(
    STORE_CONFIG,
    'default_display_currency_code'
  );

  const currencySelected = getLocalStorage('current_currency', true);
  const currency =
    useAppSelector(
      (state: RootState) => state?.storeConfig?.currentCurrency?.currency_to
    ) ??
    currencySelected?.currency_to ??
    defaultCurrencyCode;

  const { data, loading } = useQuery(AVAILABLE_CURRENCY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  console.log('data', data)
  const router = useRouter();
  const { pathname, asPath, query } = router;
  const {
    available_currency_codes: currencyCodes = null,
    exchange_rates: currencyData = null,
  } = data?.currency || {};
  const { t } = useTranslation('common');

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (currencyData) {
      setLocalStorage(CURRENCY_RATES, currencyData);
    }
  }, [currencyData]);

  useEffect(() => {
    if (!defaultCurrencyCode) {
      const isExist = currencyData?.find(
        (item: { currency_to: string }) =>
          item?.currency_to === defaultCurrencyCode
      );
      const autoCurrency = getLocalStorage(IS_AUTO_CURRENCY_SET);
      if (isExist && !autoCurrency) {
        manageCurrency(defaultCurrencyCode as string);
        setLocalStorage(IS_AUTO_CURRENCY_SET, 'IS_AUTO_CURRENCY_SET');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCurrencyCode, loading]);

  const manageCurrency = (currencyCode: string) => {
    if (!loading) {
      dispatch(
        setCurrentCurrency(
          currencyData?.find(
            (item: { currency_to: string }) =>
              item?.currency_to === currencyCode
          )
        )
      );
    }
    router.replace({ pathname, query }, asPath);
  };
  const [code, setCode] = useState(currency);
  useEffect(() => {
    setCode(currency);
  }, [currency]);
  const handleChangeList = (event: string) => {
    !loading && manageCurrency(event);
    !loading && setCode(event);
  };

  const itemOption =
    isValidArray(currencyCodes) &&
    currencyCodes.find((value: { code: string }) => {
      return value.code == code;
    });
  const currencyList =
    getValidCurrencies(data?.currency)
      ?.slice()
      .sort((a: { code: string }, b: { code: string }) => {
        const codeA = String(a.code || '').toUpperCase();
        const codeB = String(b.code || '').toUpperCase();
        return codeA.localeCompare(codeB);
      }) || [];


  console.log('header', header);
  console.log('currency', currency);
  return currency ? (
    <ErrorBoundary>
      {header ? (
        <Listbox value={currency || ''} onChange={handleChangeList}>
          {({ open }) => (
            <div className="relative">
              <ErrorBoundary>
                <ListboxButton className="-lg:w-full -lg:py-2   relative flex items-center justify-center text-2xl font-light bg-transparent border-0 cursor-pointer">
                  {loading ? (
                    <div className="rounded-full h-9 w-9 animate-pulse bg-gray-50" />
                  ) : (
                    <div className="-lg:w-full -lg:justify-between flex items-center truncate">
                      <span className={`font-normal text-sm leading-8 ${className}`}>
                        {itemOption?.symbol ?? itemOption?.code}
                      </span>
                      <motion.div
                        className="relative py-0 max-h-4"
                        initial={{ rotate: 0, marginTop: -7 }}
                        animate={{
                          rotate: open ? 180 : 0,
                          marginTop: open ? 10 : -7,
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <KeyboardArrowDownIcon className="py-0 lg:text-black" />
                      </motion.div>
                    </div>
                  )}
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
                <div className="absolute -lg:left-4 z-50 mb-2 mt-1  list-none flex flex-col focus:outline-none sm:text-sm">
                  <div
                    className="-lg:hidden absolute -top-1.5 left-[22%] -translate-x-1/2 z-20"
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
                    className="-lg:hidden absolute -top-2 left-[22%] -translate-x-1/2 z-10"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderBottom: '8px solid rgb(16 24 40 / 0.05)',
                    }}
                    aria-hidden
                  />
                  <ListboxOptions className="py-2 pl-0  overflow-auto text-base list-none -translate-x-4 bg-white rounded-md shadow-xl max-h-60 w-36 -lg:w-[307px] ring-1 ring-black/5 focus:outline-none sm:text-sm z-3">
                    {currencyList?.map(
                      (
                        value: {
                          code: string | number | boolean | null | undefined;
                        },
                        index: Key | null | undefined
                      ) => (
                        <ErrorBoundary key={index}>
                          <ListboxOption
                            className={({ active, selected }) =>
                              `flex items-center justify-between relative cursor-pointer select-none px-4 py-2 text-gray-900 ${selected ? ' bg-[#d9d9d9]/20' : 'bg-white '}`
                            }
                            value={value?.code}
                          >
                            {({ selected }) => (
                              <ErrorBoundary>
                                <span
                                  className={`block truncate ${selected
                                    ? 'font-medium text-brand'
                                    : 'font-normal'
                                    }`}
                                >
                                  {value?.code}
                                </span>
                                {selected && (
                                  <CheckIcon className="-mt-1 text-black ltr:ml-2" />
                                )}
                              </ErrorBoundary>
                            )}
                          </ListboxOption>
                        </ErrorBoundary>
                      )
                    )}
                  </ListboxOptions>
                </div>
              </Transition>
            </div>
          )}
        </Listbox>
      ) : (
        <Listbox value={currency || ''} onChange={handleChangeList}>
          {({ open }) => (
            <div className="relative mt-1">
              <ErrorBoundary>
                <ListboxButton className="relative -mx-0.5 -mt-1 flex w-60 cursor-pointer items-center justify-start rounded-md border-2 border-solid border-commonBorder bg-transparent px-3.5 py-2.5 text-base font-medium capitalize leading-5 tracking-wider text-slate-700">
                  <div className="flex items-center justify-between w-full my-0 truncate">
                    <span className="flex w-11/12 gap-1 truncate rtl:flex-row-reverse">
                      <span>{t('Currency')}</span> :{' '}
                      <span>{currency || ''}</span>
                    </span>
                    <ArrowDropDownIcon
                      className={`${open ? 'fa-arrow-down-close' : 'fa-arrow-down'}`}
                    />
                  </div>
                </ListboxButton>
              </ErrorBoundary>

              <Transition
                as={Fragment}
                enterFrom="translate-y-0 opacity-0"
                enterTo="translate-y-2 opacity-100"
                enter="transition ease-in duration-300"
                leave="transition ease-in duration-300"
                leaveFrom="translate-y-2 opacity-100"
                leaveTo="translate-y-0 opacity-0"
              >
                <ListboxOptions className="absolute z-10 mt-0.5 max-h-60 w-60 list-none overflow-auto rounded-md bg-white py-2 pl-0 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {currencyList?.map(
                    (
                      value: {
                        code: string | number | boolean | null | undefined;
                      },
                      index: Key | null | undefined
                    ) => (
                      <ErrorBoundary key={index}>
                        <ListboxOption
                          className={({ active }) =>
                            `relative cursor-pointer hover:bg-brand/10 duration-150 mx-2 rounded-md select-none px-4 py-2 
                          ${currency == value?.code ? 'bg-[#d9d9d9]/20' : 'bg-white'}
                          ${active ? ' text-brand' : 'text-gray-900'}`
                          }
                          value={value?.code}
                        >
                          {({ selected }) => (
                            <ErrorBoundary>
                              <span
                                className={`block font-medium text-base truncate ${selected ? 'text-brand' : 'text-slate-700'
                                  }`}
                              >
                                {value?.code}
                              </span>
                              {selected && (
                                <CheckIcon className="-mt-2 text-black ltr:ml-6 rtl:mr-6" />
                              )}
                            </ErrorBoundary>
                          )}
                        </ListboxOption>
                      </ErrorBoundary>
                    )
                  )}
                </ListboxOptions>
              </Transition>
            </div>
          )}
        </Listbox>
      )}
    </ErrorBoundary>
  ) : (
    <></>
  );
}
export default CurrencySwitcher;
