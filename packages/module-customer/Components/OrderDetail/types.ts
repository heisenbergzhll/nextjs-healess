export interface OrderDatatype {
  orderId: string | number | {} | undefined;
}
export interface DownloadFilesOrder {
  uid?: string;
  sort_order?: number;
  title?: string;
}
export interface orderItemType {
  quantity_shipped: number;
  quantity_invoiced?: number;
  product_name: string;
  downloadable_links?: DownloadFilesOrder[];
  product_sku: string;
  quantity_ordered: number;
  selected_options: [
    {
      value: string | number;
      label?: string;
    },
    {
      value: string | number;
      label?: string;
    },
  ];

  product_sale_price: {
    value: number;
    currency: string;
  };
}
export interface OrderDataType {
  quantity_ordered: number;
  product_sale_price: {
    value: number;
    currency: string;
  };
}
export interface QuantityPriceType {
  product_sale_price: {
    value: number;
    currency: string;
  };
}
