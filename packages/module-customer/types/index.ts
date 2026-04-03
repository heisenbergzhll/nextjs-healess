export interface CustomerAddressRegion {
  region: string;
  region_code: string;
  region_id: number;
}

export interface CustomerAddress {
  city: string;
  company?: string;
  country_code: string;
  default_billing: boolean;
  default_shipping: boolean;
  fax?: string;
  firstname: string;
  id: number;
  lastname: string;
  middlename?: string;
  postcode: string;
  prefix: string;
  region: CustomerAddressRegion;
  region_id: number;
  street: string[];
  suffix: string;
  telephone: string;
  vat_id: string;
}

export interface Customer {
  addresses: CustomerAddress[];
  default_billing?: string;
  default_shipping?: string;
  email: string;
  firstname: string;
  is_subscribed: boolean;
  lastname: string;
  token: string;
  orders: CustomerOrders;
  wishlist: Wishlist[];
  is_seller?: boolean;
}
//----------------------------------//
export interface CustomerOrders {
  items: CustomerOrder[];
  page_info: SearchResultPageInfo;
  total_count: number;
}
export interface SearchResultPageInfo {
  current_page: number;
  page_size: number;
  total_pages: number;
}
export interface CustomerOrder {
  billing_address: OrderAddress;
  carrier: string;
  id: number;
  items: OrderItemInterface[];
  number: string;
  order_date: string;
  // shipments: OrderShipment[];
  shipping_address: OrderAddress;
  shipping_method: string;
  status: string;
  // total: OrderTotal;
}

export interface OrderAddress {
  city: string;
  company: string;
  // country_code: CountryCodeEnum
  fax: string;
  firstname: string;
  lastname: string;
  middlename: string;
  postcode: string;
  prefix: string;
  region: string;
  region_id: number;
  street: string[];
  suffix: string;
  telephone: string;
  vat_id: string;
}

export interface OrderItemInterface {
  id: number;
  product_name: string;
  // product_sale_price: Money;
  product_sku: string;
  product_type: string;
  product_url_key: string;
  quantity_canceled: number;
  quantity_invoiced: number;
  quantity_ordered: number;
  // selected_options: [OrderItemOption];
  status: string;
}

export interface Country {
  available_regions: Region[];

  full_name_english: string;

  full_name_locale: string;

  id: string;

  three_letter_abbreviation: string;

  two_letter_abbreviation: string;
}

export interface Region {
  code: string;

  id: number;

  name: string;
}

export interface Wishlist {
  id: number | string;

  items_count: number;

  items_v2: WishlistItems;

  sharing_code: string;

  updated_at: string;
}

export interface WishlistItems {
  items: WishlistItemInterface[];
}

export interface WishlistItemInterface {
  added_at: string;

  description: string;

  id: number | string;

  product: ProductInterface;

  quantity: number;
}

export interface ProductInterface {
  canonical_url: string;

  name: string;

  new_from_date: string;

  new_to_date: string;

  options_container: string;

  price_range: PriceRange;

  product_links: ProductLinksInterface[];

  sku: string;

  special_price: number;

  special_to_date: string;

  thumbnail: ProductImage;

  url_key: string;

  url_suffix: string;
}

export interface PriceRange {
  maximum_price: ProductPrice;

  minimum_price: ProductPrice;
}
export interface ProductImage {
  disabled: boolean;

  label: string;

  position: number;

  url: string;
}

export interface ProductPrice {
  discount: ProductDiscount;

  final_price: Money;

  regular_price: Money;
}
export interface ProductLinksInterface {
  link_type: string;

  linked_product_sku: string;

  linked_product_type: string;

  position: number;

  sku: string;
}

export interface Money {
  currency: string;
  value: number;
}

export interface ProductDiscount {
  amount_off: number;

  percent_off: number;
}
