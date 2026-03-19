import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { getLocalStorage, STORE_CONFIG } from '@store/local-storage';
import {
  AppliedLayerFilter,
  CategoryBreadcrumb,
} from '@voguish/module-catalog/types';
import {
  OrderDataType,
  QuantityPriceType,
} from '@voguish/module-customer/Components/OrderDetail/types';
import {
  AvailablePaymentMethods, CartAddressInput,
  CartAddressInterface
} from '@voguish/module-quote/types';
import STORE_CONFIG_DATA_QUERY from '@voguish/module-store/graphql/StoreConfigData.graphql';
import { BreadcrumbProps, PageOptions } from '@voguish/module-theme/page';
import { SEARCH_FIELD } from './Constants';

/**
 * Get formatted Price.
 * @param {Float | string} price
 * @param {string} currency
 * @param {boolean} isNegative - default is false
 * @returns string
 */

export const getFormattedPrice = (
  price: number | string,
  currency?: string,
  isNegative = false
): string => {
  const currencySelected = getLocalStorage('current_currency', true);

  const selectedRate = (1 / (currencySelected?.rate ?? 1)).toFixed(4);
  const targetCurrency =
    currencySelected?.currency_to ?? currency ?? getCurrencyCode();

  let numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice)) {
    console.warn('Invalid price value:', price);
    numericPrice = 0;
  }

  numericPrice = isNegative ? -Math.abs(numericPrice) : numericPrice;
  if (currency === currencySelected?.currency_to) {
    return numericPrice.toLocaleString('en-US', {
      style: 'currency',
      currency: currency ?? getCurrencyCode(),
    });
  }
  const convertedPrice = numericPrice * Number(currencySelected?.rate ?? 1);

  const currencyCode = targetCurrency?.toUpperCase?.() || 'USD';

  try {
    return convertedPrice.toLocaleString('en-US', {
      style: 'currency',
      currency: currencyCode,
    });
  } catch (error) {
    console.warn('Invalid currency code:', currencyCode);
    return convertedPrice.toFixed(2); // fallback format
  }
};

/**
 * Get Currency code.
 *
 * @returns string
 */
export const getCurrencyCode = () => {
  let currency = 'USD';

  let config = getLocalStorage(STORE_CONFIG, true);

  if (config && config.default_display_currency_code) {
    currency = config.default_display_currency_code;
  }
  return currency;
};

/**
 * Check array is valid or not
 *
 * @param {Array} arr
 * @returns boolean
 */
export const isValidArray = (arr: any) => {
  return arr && Array.isArray(arr) && arr.length > 0;
};

/**
 *
 * @param {Object} obj
 * @returns boolean
 */
export function isValidObject(obj: any) {
  return obj && Object.keys(obj).length > 0 && obj.constructor === Object;
}

/**
 *
 * @returns {Object}
 */
export const createGraphQLClient = () => {
  const uri = `${process.env.MAGENTO_ENDPOINT}graphql`;
  const httpLink = createHttpLink({ uri });

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
};

/**
 *
 * @returns {boolean}
 */
export const isMarketplaceEnable = async () => {
  const client = createGraphQLClient();

  try {
    const { data } = await client.query({
      query: STORE_CONFIG_DATA_QUERY,
    });
    return data?.storeConfig?.marketplace_is_active || false;
  } catch (error) {
    return false;
  }
};

/**
 *
 * @param {String} requestedDate
 * @returns String
 */

export const getFormattedDate = (
  requestedDate: string,
  format = 'mm/dd/yy'
) => {
  requestedDate =
    typeof requestedDate == 'string'
      ? requestedDate.replace(/-/g, '/')
      : requestedDate;
  const date: any = new Date(requestedDate);

  const year = date.getFullYear().toString();
  let month: number | string | any = date.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }

  let dateStr: any =
    date.getDate().length === 0 ? '0' + date.getDate() : date.getDate();

  if (dateStr < 10) {
    dateStr = '0' + dateStr;
  }

  if (format === 'dd.mm.yyyy') {
    return dateStr + '.' + month + '.' + year;
  }
  if (format === 'yyyy-mm-dd') {
    return year + '-' + month + '-' + dateStr;
  }
  if (format === 'h:i:A') {
    let hours = date.getHours();
    let minutes: string | number | any = date.getMinutes();
    const amPm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + amPm;
  }

  if (format === 'dd/mm/yyyy') {
    return dateStr + '/' + month + '/' + year;
  }
  return month + '/' + dateStr + '/' + year.substring(2);
};
export const filteredLabel = (value: string, array: any) => {
  if (array) {
    return isValidArray(
      array.filter((label: any) =>
        label.label?.toLowerCase().includes(value.toLowerCase())
      )
    );
  }
};

export const parseAddress = (
  address: CartAddressInterface
): CartAddressInput => {
  return {
    firstname: address?.firstname || '',
    lastname: address?.lastname || '',
    street: address?.street || '',
    city: address?.city || '',
    region: address?.region.code || '',
    region_id: address?.region.region_id || 0,
    country_code: address?.country.code,
    postcode: address?.postcode || '',
    telephone: address?.telephone || '',
    save_in_address_book: false,
    company: address?.company || '',
  };
};

/**
 * Parsing applied filter to hide applied filter for pages
 *
 * @param filters
 * @param activePageFilter
 * @param activePageFilterValue
 * @returns AppliedLayerFilter[]
 */
export const parseAppliedFilter = (
  filters: AppliedLayerFilter[] | undefined
) => {
  const defaultFilter = filters?.find(
    (filter) => filter.attribute_code === 'category_uid'
  );
  if (defaultFilter?.options?.length === 1) {
    return filters?.filter(
      (filter) => filter.attribute_code !== 'category_uid'
    );
  }
  if (defaultFilter?.options && defaultFilter.options.length > 1) {
    if (filters) {
      return filters.map((filter) => {
        if (
          filter.attribute_code === 'category_uid' &&
          filter.options &&
          filter.options.length > 1
        ) {
          return {
            ...filter,
            options: filter.options.slice(1),
          };
        }
        return filter;
      });
    }
    return [];
  }
  return filters;
};

export function getFlagEmoji(countryCode: string) {
  let emojiCode = countryCode === 'default' ? 'us' : countryCode.slice(0, -1);
  try {
    const codePoints = emojiCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  } catch (error) {
    return '';
  }
}
/**
 *  Get Country name from Country code using JavaScript
 */
export const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
/**
 *
 * @param orderItem calculate total quantity price of product
 * @returns
 */

export const calcSubtotal = (orderItem: OrderDataType) => {
  const totalQuantity = orderItem?.quantity_ordered
    ? orderItem?.quantity_ordered
    : 1;
  const totalPrice = orderItem?.product_sale_price?.value
    ? orderItem?.product_sale_price?.value
    : 1;
  const price = totalQuantity * totalPrice;
  const currency = orderItem?.product_sale_price?.currency;
  return getFormattedPrice(price, currency);
};
/**
 *
 * @param orderItem this function get the fomated price with currency
 * @returns
 */
export function getFormattedPriceValue(QuantityPrice: QuantityPriceType) {
  const orderPrice = QuantityPrice?.product_sale_price;
  return getFormattedPrice(orderPrice?.value, orderPrice?.currency);
}
/**
 *
 * @param queries
 * @param itemCode
 * @param itemValue
 * @returns string | string[]
 */
export function createQueryForLink(
  queries: string | string[],
  itemCode: string,
  itemValue: string,
  removePagination: boolean
) {
  let fieldParam: string | string[]; // Use an array type to keep consistency

  if (
    !queries.includes(itemValue) &&
    removePagination &&
    Array.isArray(queries)
  ) {
    const limitIndex = queries.indexOf('limit');
    const pageIndex = queries.indexOf('page');

    if (pageIndex !== -1) {
      queries = queries.filter(
        (_, i) => i !== pageIndex && i !== pageIndex + 1
      );
    }

    if (limitIndex !== -1) {
      queries = queries.filter(
        (_, i) => i !== limitIndex && i !== limitIndex + 1
      );
    }
  }

  if (itemCode && Array.isArray(queries)) {
    // Find the index of the itemCode in the queries array
    const index = queries.indexOf(itemCode);

    if (index !== -1) {
      const indexOfValue = queries.indexOf(itemValue);

      // If itemCode exists, create a new array excluding the key and its value
      fieldParam = queries.filter((_, i) => i !== index && i !== index + 1);

      if (indexOfValue == -1 && itemValue && !fieldParam) {
        fieldParam = [...fieldParam, itemCode, itemValue];
      }
    } else {
      // If itemCode doesn't exist, return the original array
      fieldParam = [...queries, itemCode, itemValue];
    }
  } else {
    // If itemCode is empty, return the original array
    fieldParam = queries;
  }
  return fieldParam;
}

export const createPageOptions = (
  breadcrumbs: CategoryBreadcrumb[],
  title: string,
  uid: string
): PageOptions => {
  if (isValidArray(breadcrumbs)) {
    let thisTitle = title;
    let breads: BreadcrumbProps[] = [];
    breadcrumbs.forEach(({ category_name, category_uid, category_url_key }) => {
      thisTitle = `${thisTitle}-${category_name}`;
      breads = [
        ...breads,
        {
          label: category_name,
          url: `catalog/category/${category_url_key}`,
          uid: category_uid,
        },
      ];
    });
    return {
      title: thisTitle,
      breadCrumbs: [...breads, { label: title, uid }],
    };
  }
  return {
    title,
  };
};
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader?.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}
export function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
export function parseQuery(params?: { urlKey: string[] }) {
  if (!params?.urlKey) return [undefined, undefined] as const;
  const urlKey = params.urlKey?.[0];
  const query = params.urlKey.slice(1);
  return [urlKey, query] as const;
}
export function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}
export const getInitials = (name: string) => {
  const initials = name
    .split(' ')
    .map((word) => word[0]?.toUpperCase())
    .join('');

  return initials;
};
export function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 50,
      height: 50,
    },
    children: getInitials(name),
  };
}
export function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}
export const labels: { [index: string]: string } = {
  0: '(0/5)',
  1: '(1/5)',
  2: '(2/5)',
  3: '(3/5)',
  4: '(4/5)',
  5: '(5/5)',
};
export function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}
export function containSymbol(newPassword: string) {
  return /[!@#$%^&*>.<]/.test(newPassword);
}
export function containAlphabet(newPassword: string) {
  return /[A-Z]/.test(newPassword);
}
export function containNumber(newPassword: string) {
  return /[0-9]/.test(newPassword);
}
export function checkLength(newPassword: string) {
  if (newPassword?.length >= 8) {
    return true;
  } else {
    return false;
  }
}
export const getCurrencySymbol = (currencyCode = 'USD') => {
  return (0)
    .toLocaleString('en', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, '')
    .trim()
    ?.replaceAll('US', '');
};
export function formatISODate(isoString: string): string {
  const date = new Date(isoString);

  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
export const getLocalStore = (
  availableStores: {
    code: string;
    store_code: string;
    locale_code?: string;
    locale?: string;
  }[],
  locale: string
): string => {
  const store = availableStores.find((store) => {
    const storeLocale = store.locale_code || store.locale;
    const normalizedStoreLocale = storeLocale?.split('_')?.[0];
    return normalizedStoreLocale === locale;
  });

  return store?.store_code ?? process.env.DEFAULT_STORE_CODE ?? '';
};

export function getTotalPages(totalItems: number, pageSize: number) {
  return Math.ceil(totalItems / pageSize);
}
export const getUniqueArray = (arr: any): any[] => {
  if (!Array.isArray(arr)) return [];

  const is_exist = new Set();
  const options = [];

  for (const option of arr) {
    if (option && !is_exist.has(option.value)) {
      is_exist.add(option.value);
      options.push(option);
    }
  }
  return options;
};
// categories list duplicate filter with name
export const getUniqueCategories = (arr: any): any[] => {
  if (!Array.isArray(arr)) return [];

  const is_exist = new Set();
  const options = [];

  for (const option of arr) {
    if (option && !is_exist.has(option.label)) {
      is_exist.add(option.label);
      options.push(option);
    }
  }
  return options;
};
export const getCategoryFilterQuery = (
  query: any,
  attribute: string,
  value: string,
  deletion = false
): string => {
  try {
    let pathAsArray = query?.asPath?.split('/')?.filter(Boolean) || [];

    const isSingleFilter = ['price', 'page', 'limit', 'sort'].includes(
      attribute
    );
    const attrIndex = pathAsArray.findIndex((i: string) => i === attribute);
    const valueIndex = pathAsArray.findIndex((i: string) => i === value);

    // Handle single-valued filters (overwrite or delete)
    if (isSingleFilter && attrIndex > -1) {
      if (deletion) {
        pathAsArray.splice(attrIndex, 2); // remove attribute and its value
      } else if (value) {
        pathAsArray[attrIndex + 1] = value; // update value
      }
    }
    // Handle multi-valued filters (like color, size)
    else if (valueIndex > -1) {
      if (deletion) {
        const attrPos = valueIndex - 1;
        pathAsArray.splice(attrPos, 2); // remove attribute and its value
      }
    } else if (!deletion) {
      pathAsArray.push(attribute, value); // add new filter
    }

    return `/${pathAsArray.join('/')}`;
  } catch (error) {
    return '/';
  }
};

export const getSearchedQuery = (pathname: string) => {
  const pathAsArray = pathname?.split('/')?.filter((i: string) => i && i);
  const searchFieldIndex = pathAsArray?.findIndex(
    (i: string) => i === SEARCH_FIELD
  );
  return pathAsArray?.at(searchFieldIndex + 1) ?? '';
};

export const getPageLimit = (pathname: string) => {
  const pathAsArray = pathname?.split('/')?.filter((i: string) => i && i);
  const index = pathAsArray?.indexOf('limit');
  return Number(pathAsArray[index + 1] ?? 9);
};

export const getShortValue = (pathname: string) => {
  const pathAsArray = pathname?.split('/')?.filter((i: string) => i && i);
  const index = pathAsArray?.indexOf('sort');
  return pathAsArray[index + 1];
};
export const getSearchVariables = (search: string, path: string) => {
  const productsQueryInput: any = {
    filters: {},
    search: search,
  };
  const input = path?.split('/')?.filter((i) => i && i);
  const index = input.indexOf('searchField');
  if (index !== -1 && index + 1 < input.length) {
    const sliced = input?.slice(index + 2);
    for (const [i, item] of sliced?.entries()) {
      if (item === 'sort') {
        const sortRange = sliced[i + 1]?.split('_');
        productsQueryInput.sort = {
          [sortRange[0]]: sortRange[1]?.toUpperCase(),
        };
      } else if (item === 'limit') {
        productsQueryInput.pageSize = Number(sliced?.at(i + 1));
      } else if (item === 'page') {
        productsQueryInput.currentPage = Number(sliced?.at(i + 1));
      } else if (item === 'price') {
        const priceRange = sliced[i + 1]?.split('_');
        const filterValue = { from: priceRange?.at(0), to: priceRange?.at(1) };
        productsQueryInput.filters = {
          ...productsQueryInput.filters,
          price: filterValue,
        };
      } else {
        const excludeKeys = sliced.filter(
          (_, index: number) => index % 2 === 0
        );
        if (excludeKeys.includes(item)) {
          const existing = productsQueryInput.filters[item]?.in || [];
          productsQueryInput.filters[item] = {
            in: [...existing, sliced?.at(i + 1)],
          };
        }
      }
    }
  }
  return productsQueryInput;
};

export const getPriceRangeFilter = (
  filter: any,
  path: string,
  defaultValue = false
) => {
  try {
    if (filter?.attribute_code === 'price') {
      if (path?.includes('price') && !defaultValue) {
        const input = path?.split('/')?.filter((i) => i && i);
        const index = input?.findIndex((i) => i === 'price');
        return input[index + 1]?.split('_')?.map((i: string) => Number(i));
      }
      return filter?.options
        ?.at(0)
        ?.value?.split('_')
        ?.map((i: string) => Number(i));
    }
    return [0, 0];
  } catch (error) {
    console.error('Error :', error);
  }
};

export const isSelectedFilter = (
  attributeCode: string,
  value: string,
  asPath: string
): boolean => {
  let pathArray = asPath?.split('/')?.filter((i: string) => i);
  if (asPath?.includes('category')) {
    pathArray = pathArray?.slice(2);
    return (
      pathArray?.some((i) => i === value) &&
      pathArray?.some((i) => i === attributeCode)
    );
  }
  if (asPath?.includes('searchField')) {
    pathArray = pathArray?.slice(4);
    return (
      pathArray?.some((i) => i === value) &&
      pathArray?.some((i) => i === attributeCode)
    );
  }
  return false;
};

export const getClearAllPath = (asPath: string): string => {
  let pathArray = asPath?.split('/')?.filter((i: string) => i);
  if (asPath?.includes('searchField')) {
    pathArray = pathArray?.slice(0, 4);
    return `/${pathArray?.join('/')}`;
  }
  if (asPath?.includes('category')) {
    pathArray = pathArray?.slice(0, 3);
    return `/${pathArray?.join('/')}`;
  }
  return '/';
};

export const stripEmptyFields = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;

  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        acc[key] = typeof value === 'object' ? stripEmptyFields(value) : value;
      }
      return acc;
    },
    {} as Record<string, any>
  );
};

export const getSharePathUrl = (asPath: string) => {
  return asPath ? process.env.MAGENTO_ENDPOINT + asPath : null;
};

export const isShallowEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (let key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || a[key] !== b[key]) {
      return false;
    }
  }

  return true;
};
export const convertStringToHTML = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  document?.body?.appendChild(doc.body);
  const form = document.getElementById('pay_form') as HTMLFormElement | null;
  form?.submit();
  return doc.body;
};

export const getUserAgent = () => {
  const terminal = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 0 : 1;
  return terminal;
}

export const sortPaymentOptions = (availablePaymentMethods: AvailablePaymentMethods[]) => {
  const titleMap: Record<string, string> = {
    adyen_cc: 'Credit / Debit Card',
    nihaopay_payments_wechatpay: 'WeChat Pay',
    nihaopay_payments_unionpay: 'China Union Pay',
    paypal_express: 'PayPal',
  };

  const order = [
    'adyen_cc',
    'paypal_express',
    'clearpay',
    'nihaopay_payments_alipay',
    'nihaopay_payments_wechatpay',
    'nihaopay_payments_unionpay',
    'checkmo',
  ];

  const excluded = new Set([
    'adyen_oneclick',
    'adyen_hpp',
    'checkmo',
    'clearpay',
  ]);

  const orderIndex = new Map(order.map((code, index) => [code, index]));
  const getIndex = (code: string) => orderIndex.get(code) ?? order.length;

  return availablePaymentMethods
    .filter((payment) => !excluded.has(payment.code))
    .sort((a, b) => getIndex(a.code) - getIndex(b.code))
    .map((payment) => ({
      label: titleMap[payment.code] ?? payment.title,
      value: payment.code,
    }));
}


export const getPaypalCurrency = (locale: string): string => {
  const normalized = (locale || '').toLowerCase().split('-')[0];

  const currencyMap: Record<string, string> = {
    cn: 'GBP',
    en: 'GBP',
    us: 'USD',
    mex: 'GBP',
  };
  return currencyMap[normalized] ?? 'GBP';
};

export const getAdyenLocal = (locale: string): string => {
  const normalized = (locale || '').toLowerCase().split('-')[0];
  const localeMap: Record<string, string> = {
    cn: 'zh-CN',
    en: 'en_US',
    us: 'en_US',
    mex: 'es_ES',
  };
  return localeMap[normalized] ?? 'en_GB';
};

export const getAdyenCountryCode = (locale: string): string => {
  const normalized = (locale || '').toLowerCase().split('-')[0];
  const countryCodeMap: Record<string, string> = {
    cn: 'CN',
    en: 'GB',
    us: 'US',
    mex: 'MX',
  };
  return countryCodeMap[normalized] ?? 'GB';
};
