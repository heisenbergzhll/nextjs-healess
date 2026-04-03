export const MODE = 'development';
export const BASE_URL = 'http://localhost:3000';
export const MAGENTO_URL = process.env.MAGENTO_ENDPOINT;
export const MAGENTO_REST_API_URL = MAGENTO_URL + 'rest/V1/';

export const PLACEHOLDER_IMG = '/assets/img/products/placeholder.jpg';
export const BANNERPLACEHOLDER_IMG = '/assets/img/products/placeholder.jpg';
export const Pattern = '/assets/img/bgpattern.jpg';
export const CONTACT_US = '/assets/img/contact.webp';
export const top_selling = 1;
export const top_rated = 2;
export const top_brand = 3;
export const LOADING = 'loading';
export const IS_AUTO_CURRENCY_SET = 'IS_AUTO_CURRENCY_SET';

export const limiter = [9, 27, 54, 72, 100];
export const errorCatEnity = ['graphql-no-such-entity'];
export const errorCat = ['graphql-authorization'];

export const searchAction = 'search';
export const sortByAction = 'sortBy';
export const sortDirAction = 'sortDir';
export const sortAction = 'sort';
export const resetAction = 'reset';
export const viewAction = 'view';
export const priceRangeFilterAction = 'price';
export const colorFilterAction = 'color';
export const categoryIDFilterAction = 'category_id';
export const filterAction = 'filter';

export const LAYOUT_1 = 1;
export const LAYOUT_2 = 2;
export const LAYOUT_3 = 3;

export const FEEDS_FRACTION = 20;
export const authorizationErr = 'The current customer is not authorized.';
export const RECAPTCHA = 'RECAPTCHA';
export const REGISTER_IN_PROGRESS = 'IN_PROGRESS';

export const BRAND_HEX_CODE = '#155e59';
export const WHITE_HEX_CODE = '#fff';
export const SEARCH_FIELD = 'searchField';
export const PAYMENT_METHODS_CONST = {
  CHECK_MO: 'checkmo',
  STRIPE: 'stripe_payments',
  PAYPAL: 'paypal',
  CASH_ON_DELIVERY: 'cashondelivery',
};

export const buildValidAddressPayload = (
  data: any,
  regionId: number | undefined
) => {
  const address: Record<string, any> = {};

  if (typeof data.firstname === 'string' && data.firstname.trim() !== '') {
    address.firstname = data.firstname;
  }
  if (typeof data.lastname === 'string' && data.lastname.trim() !== '') {
    address.lastname = data.lastname;
  }
  if (typeof data.city === 'string' && data.city.trim() !== '') {
    address.city = data.city;
  }
  if (
    typeof data.country_code === 'string' &&
    data.country_code.trim() !== ''
  ) {
    address.country_code = data.country_code;
  }
  if (typeof data.postcode === 'string' && data.postcode.trim() !== '') {
    address.postcode = data.postcode;
  }
  if (
    data.region &&
    typeof data.region === 'string' &&
    data.region.trim() !== ''
  ) {
    address.region = data.region;
  }
  if (Array.isArray(data.street)) {
    // Include only non-empty street parts
    const street = data.street.filter(
      (line: any) => typeof line === 'string' && line.trim() !== ''
    );
    if (street.length > 0) {
      address.street = street;
    }
  }
  if (typeof data.telephone === 'string' && data.telephone.trim() !== '') {
    address.telephone = data.telephone;
  }
  if (
    regionId &&
    data.region_id &&
    typeof data.region_id === 'number' &&
    data.region_id > 0
  ) {
    address.region_id = data.region_id;
  }
  if (typeof data.save_in_address_book === 'boolean') {
    address.save_in_address_book = data.save_in_address_book;
  }

  return address;
};

export const sortByPositionAsc = (array: any) => {
  return [...(array ?? [])].sort((a, b) => {
    const posA = a?.position;
    const posB = b?.position;

    if (posA != null && posB != null) {
      return posA - posB;
    }

    if (posA != null) return -1;
    if (posB != null) return 1;

    return 0;
  });
};

export const getValidCurrencies = (data: any) => {
  if (!data?.available_currency_codes || !data?.exchange_rates) {
    return [];
  }
  return data.available_currency_codes.filter((currency: any) => {
    const exchangeRate = data.exchange_rates.find(
      (rate: any) => rate.currency_to === currency.code && rate.rate
    );
    return Boolean(exchangeRate);
  });
};

export const AUTHORIZED = 'authenticated';
export const fadeInUp = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94], // smoother than easeOut
    },
  },
};

export const IS_SELLER = 'yes';
