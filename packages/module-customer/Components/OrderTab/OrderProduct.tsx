import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getFormattedDate, getFormattedPrice } from '@utils/Helper';

import { NoOrderProduct } from '@voguish/module-customer/Components/OrderTab/NoOrderProduct';
import { OrderPlaceHolder } from '@voguish/module-customer/Components/OrderTab/OrderPlaceHolder';
import { useCustomerQuery } from '@voguish/module-customer/hooks/useCustomerQuery';

import Tab from '@voguish/module-customer/Components/OrderTab/Tab';
import GET_ORDER from '@voguish/module-customer/graphql/CustomerOrderProduct.graphql';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  DeliveredIcon,
  OrderIcon,
  OrderRightIcon,
  ProcessingIcon,
  TransitIcon,
} from '~packages/module-theme/components/elements/Icon';
import Sidebar from '../Layout/Sidebar';
const ReOrderItem = dynamic(() => import('./ReOrderItem'));
const Pagination = dynamic(() => import('./Pagination'));
const BASE_IMAGE_URL = 'https://www.haitaoweb.com/media/catalog/product';
const placeHolders = new Array(3).fill(0);

// 订单状态样式映射
const STATUS_STYLES: Record<
  string,
  {
    bg: string;
    color: string;
    icon: React.ReactElement;
    label: string;
    className: string;
  }
> = {
  Delivered: {
    bg: '#F0FDF4',
    color: '#16A34A',
    icon: <DeliveredIcon />,
    label: 'Delivered',
    className: '',
  },
  'In Transit': {
    bg: '#FFFBEB',
    color: '#D97706',
    icon: <TransitIcon />,
    label: 'In Transit',
    className: '',
  },
  Processing: {
    bg: '#EFF6FF',
    color: '#2563EB',
    icon: <ProcessingIcon />,
    label: 'Processing',
    className: 'min-w-[7.5rem]',
  },
  Canceled: {
    bg: '#FEF2F2',
    color: '#DC2626',
    icon: <OrderIcon />,
    label: 'Canceled',
    className: '',
  },
  Pending: {
    bg: '#F5F5F5',
    color: '#6B7280',
    icon: <OrderIcon />,
    label: 'Pending',
    className: '',
  },
};

type payloadActionType = {
  payload: number;
};
interface CustomerItemDataType {
  number: string;
  order_date: string;
  status: string;
  total: FormatPriceDataType;
  items: OrderItemsType[];
}
export interface OrderItemsType {
  product_name: string;
  product_image: string;
  product_sku: string;
  product_url_key: string;
  quantity_ordered: number;
  product_price: any;
  product_sale_price: any;
}
/**
 * Price format DataType
 */
interface FormatPriceDataType {
  grand_total: {
    value: number;
    currency: string;
  };
}
interface FormatPorudctPriceDataType {
  value: number;
  currency: string;
}

/**
 * Get Price format
 */
function getFormattedPriceValue(total: FormatPriceDataType) {
  const productPrice = total?.grand_total;
  return getFormattedPrice(productPrice?.value, productPrice?.currency);
}
function getFormattedProductSalePriceValue(
  productPrice: FormatPorudctPriceDataType
) {
  return getFormattedPrice(productPrice?.value, productPrice?.currency);
}

const OrderProduct = () => {
  const [pageSize, setPageSize] = useState(5);
  const { data, loading /*, error */ } = useCustomerQuery(GET_ORDER, {
    variables: { currentPage: 1, pageSize: pageSize },
  });
  const total_order = data?.customer?.orders?.total_count;
  const orders = data?.customer?.orders.items;
  const managePagination = ({ payload }: payloadActionType) => {
    setPageSize(payload);
  };
  const { t } = useTranslation('common');
  const items: any[] = [
    {
      id: 1,
      name: t('All Orders'),
    },
    {
      id: 2,
      name: t('Delivered'),
    },
    {
      id: 3,
      name: t('In Transit'),
    },
    {
      id: 4,
      name: t('Processing'),
    },
  ];
  return (
    <Sidebar>
      <Grid container>
        <Grid item className="mb-3 " xs={12}>
          <div className="mb-6">
            <Typography
              variant="h4"
              component="div"
              className="font-medium text-[1.5rem] h-[2.25rem] leading-[2.25rem]"
            >
              {t('My Orders')}
            </Typography>
            <Typography
              variant="body1"
              component="div"
              className="font-light text-[#62748E] text-sm h-[1.3125rem] leading-[1.3125rem] tracking-normal"
            >
              {t('Track and manage your recent orders')}
            </Typography>
          </div>
          <div className="flex w-full ">
            <Tab className="!border-none" right={false} items={items} />
          </div>
        </Grid>

        <Grid item className="grid w-full gap-4 lg:grid-cols-2 xl:grid-cols-1">
          {loading ? (
            <OrderPlaceHolder placeHolders={placeHolders} />
          ) : orders?.length > 0 ? (
            orders?.map((item: CustomerItemDataType, index: number) => (
              <Grid
                item
                xs={12}
                key={index}
                className="pt-1 rounded-2xl"
                sx={{
                  borderBottom: 1,
                  border: '1px solid gray',
                  borderColor: 'themeAdditional.borderColor',
                }}
              >
                <Grid sx={{ padding: '2px 0px 0px 0px' }}>
                  <Grid className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-solid border-0 border-b border-[#E2E8F0] py-4 px-3 lg:px-6">
                    <Grid item xs={12}>
                      <div className="group w-full flex items-center  no-underline gap-3">
                        <OrderIcon
                          className={`transition-colors duration-150 text-[#90A1B9]`}
                        />
                        <Typography
                          variant="body2"
                          color="black"
                          className="flex gap-0.5 font-normal"
                        >
                          {t('ORD')} <span> {'-' + item.number}</span>
                          <span className="text-[#62748E] font-normal mx-2">
                            |
                          </span>
                          <span className="text-[#62748E] font-normal">
                            {getFormattedDate(item.order_date, 'd Month yyyy')}
                          </span>
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item xs={12}>
                      <div className="group w-full flex items-center justify-between lg:justify-end  no-underline gap-3 mt-3 lg:mt-0">
                        {(() => {
                          const statusStyle =
                            STATUS_STYLES[item?.status] ||
                            STATUS_STYLES['Processing'];
                          return (
                            <Chip
                              icon={statusStyle.icon}
                              label={statusStyle.label}
                              className={`${statusStyle.className}`}
                              variant="outlined"
                              sx={{
                                borderRadius: '9999px',
                                border: 'none',
                                borderColor: 'transparent',
                                px: 0.5,
                                color: statusStyle.color,
                                backgroundColor: statusStyle.bg,
                                '& .MuiChip-icon': {
                                  color: statusStyle.color,
                                },
                                '& .MuiChip-label': {
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  // paddingLeft: '4px',
                                },
                              }}
                            />
                          );
                        })()}

                        <Typography
                          variant="body2"
                          color="black"
                          className="flex gap-0.5 font-normal"
                        >
                          <span className="text-black font-semibold text-base	">
                            {getFormattedPriceValue(item?.total)}
                          </span>
                        </Typography>
                      </div>
                    </Grid>
                  </Grid>
                  {item.items &&
                    item.items.map((product, index) => (
                      <Grid className="px-3 lg:px-6" key={index}>
                        <div
                          className={`flex flex-col md:flex-row md:justify-between md:items-center py-4 ${item.items.length > 1 && index !== item.items.length - 1 ? 'border-0 border-b border-solid border-[#E2E8F0]' : ''}`}
                        >
                          <Grid
                            item
                            xs={12}
                            md={6}
                            className="flex flex-row md:justify-start lg:items-center gap-4"
                          >
                            <ErrorBoundary>
                              <Image
                                src={BASE_IMAGE_URL + product?.product_image}
                                width={72}
                                height={72}
                                className="rounded-md"
                                alt={product?.product_name}
                              />
                            </ErrorBoundary>
                            <div className="flex flex-col justify-center">
                              <Typography
                                variant="body2"
                                className="text-black text-sm font-medium mb-1 leading-[21px]"
                              >
                                {product?.product_name}
                              </Typography>
                              <Typography variant="body2" className="">
                                Qty : {product?.quantity_ordered}
                              </Typography>
                            </div>
                          </Grid>
                          <Grid item xs={12} md="auto" sx={{ px: 1, pb: 1 }}>
                            <Typography
                              variant="body2"
                              className="text-black text-sm font-medium  leading-[21px] text-right md:text-left"
                            >
                              {getFormattedProductSalePriceValue(
                                product?.product_sale_price
                              )}
                            </Typography>
                          </Grid>
                        </div>
                      </Grid>
                    ))}
                </Grid>
                <Grid
                  sx={{
                    borderTop: 1,
                    borderRadius: '0 0 16px 16px', // 只保留底部圆角
                    borderColor: '#E2E8F0',
                    backgroundColor: '#F1F5F9',
                  }}
                >
                  <Grid
                    px={0}
                    className="flex px-3 lg:px-6"
                    item
                    gap={2}
                    justifyContent="flex-end "
                  >
                    {/* <Grid className="my-1 font-normal">
                      <ReOrderItem orderId={item?.number} />
                    </Grid> */}

                    <Grid>
                      <Button
                        className="my-1 mt-[5px] !h-9 border-none text-[#BB742F] text-sm shadow-none !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent  hover:!border-none active:!border-none focus:!border-none"
                        size="small"
                        component={Link}
                        endIcon={<OrderRightIcon />}
                        variant="outlined"
                        href={`/sales/order/${item?.number}`}
                      >
                        {t('View Order Details')}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ))
          ) : (
            <NoOrderProduct />
          )}
        </Grid>

        <Grid
          className="w-full"
          item
          lg={12}
          sx={{
            borderWidth: '1px',
            borderColor: 'themeAdditional.borderColor',
          }}
        >
          <ErrorBoundary>
            <Pagination
              pageSize={5}
              currentPage={1}
              changeHandler={managePagination}
              loadingState={loading}
              totalCount={total_order || 0}
            />
          </ErrorBoundary>
        </Grid>
      </Grid>
    </Sidebar>
  );
};
export default OrderProduct;
