import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {
  calcSubtotal,
  getFormattedDate,
  getFormattedPrice,
  getFormattedPriceValue,
  isValidArray,
  isValidObject,
  regionNames,
} from '@utils/Helper';
import TabPlaceHolder from '@voguish/module-catalog/Components/Product/Detail/placeholder/TabPlaceHolder';
import Placeholder from '@voguish/module-catalog/Components/Product/Item/Placeholder';
import { TabsProp } from '@voguish/module-catalog/types';
import GET_ORDER from '@voguish/module-customer/graphql/OrderFilter.graphql';
import { useCustomerQuery } from '@voguish/module-customer/hooks/useCustomerQuery';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Containers from '@voguish/module-theme/components/ui/Container';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { OrderviewPlaceholder } from './OrderviewPlaceholder';
import { OrderDatatype, orderItemType } from './types';
const ReOrderItem = dynamic(() => import('../OrderTab/ReOrderItem'));
const MobileViewDropdown = dynamic(
  () => import('@voguish/module-theme/components/ui/MobileViewDropdown')
);
const Tab = dynamic(
  () => import('@voguish/module-theme/components/widgets/Tab')
);

function OrderView({ orderId }: OrderDatatype) {
  const { t } = useTranslation('common');

  const { data, loading /*, error */ } = useCustomerQuery(GET_ORDER, {
    variables: { filter: { number: { eq: orderId } } },
  });
  const orderDetail = data?.customer?.orders?.items[0];
  const subtotalPrice = orderDetail?.total?.subtotal;
  const shippingPrice = orderDetail?.total?.total_shipping;
  const GrandTotalPrice = orderDetail?.total?.grand_total;
  const shippingAddress = orderDetail?.shipping_address;
  const billingAddress = orderDetail?.billing_address;
  const totalOrder = data?.customer?.orders?.total_count;
  const refunds = orderDetail?.credit_memos[0];
  const refundSubtotal = refunds?.total?.subtotal;
  const refundshipping = refunds?.total?.total_shipping;
  const refundtotal = refunds?.total?.grand_total;
  const refunddiscount = refunds?.total?.discounts[0];

  const items: TabsProp[] = [
    {
      id: 1,
      name: t('Order Details'),
      render: () => {
        return (
          <div className="py-5 lg:p-5">
            {loading ? (
              <OrderviewPlaceholder />
            ) : totalOrder == 1 ? (
              <ErrorBoundary>
                <div className="flex items-center justify-between w-full gap-4 pb-5">
                  <Typography variant="subtitle1">
                    {' '}
                    {t('Order No:')} #{orderDetail?.number}
                  </Typography>
                  <Typography variant="body2">
                    {getFormattedDate(orderDetail?.order_date, 'dd/mm/yyyy')}
                  </Typography>
                </div>

                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 rtl:text-right">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          {t('Product Name')}
                        </th>
                        <th scope="col" className="px-6 py-3">
                          {t('Sku')}
                        </th>
                        <th />
                        <th />
                        <th scope="col" className="px-6 py-3">
                          {t('Price')}
                        </th>

                        <th scope="col" className="px-6 py-3">
                          {t('Quantity')}
                        </th>
                        <th scope="col" className="flex justify-end px-6 py-3">
                          {t('Total')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetail?.items?.map(
                        (orderItem: orderItemType, index: number) => (
                          <tr className="bg-white border-b" key={index}>
                            <th
                              scope="col"
                              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                            >
                              {orderItem?.product_name}
                            </th>
                            <td className="grid gap-1.5 px-6 py-4">
                              {orderItem?.product_sku}
                            </td>
                            <td />
                            <td />
                            <td className="px-6 py-4">
                              {getFormattedPriceValue(orderItem)}
                            </td>

                            <td className="px-12 py-4">
                              {orderItem?.quantity_ordered}
                            </td>
                            <td className="flex justify-end px-6 py-4">
                              {calcSubtotal(orderItem)}
                            </td>
                          </tr>
                        )
                      )}

                      <tr>
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <th
                          scope="row"
                          align="left"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {t('Subtotal')}
                        </th>
                        <td className="flex justify-end px-6 py-4">
                          {getFormattedPrice(
                            subtotalPrice?.value,
                            subtotalPrice?.currency
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <th
                          scope="row"
                          align="left"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {t('Shipping')}
                        </th>
                        <td className="flex justify-end px-6 py-4">
                          {getFormattedPrice(
                            shippingPrice?.value,
                            shippingPrice?.currency
                          )}
                        </td>
                      </tr>

                      {isValidArray(orderDetail?.total?.discounts) &&
                        orderDetail?.total?.discounts.map(
                          (
                            item: {
                              label: string;
                              amount: { value: number; currency: string };
                            },
                            index: number
                          ) => (
                            <tr key={item?.label + index}>
                              <td />
                              <td />
                              <td />
                              <td />
                              <td />
                              <th
                                scope="row"
                                align="left"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                              >
                                {item?.label}
                              </th>
                              <td className="flex justify-end px-6 py-4">
                                -
                                {getFormattedPrice(
                                  item?.amount?.value,
                                  item?.amount?.currency
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      {isValidArray(orderDetail?.total?.taxes) &&
                        orderDetail?.total?.taxes.map(
                          (
                            item: {
                              title: string;
                              amount: { value: number; currency: string };
                            },
                            index: number
                          ) => (
                            <tr key={item?.title + index}>
                              <td />
                              <td />
                              <td />
                              <td />
                              <td />
                              <th
                                scope="row"
                                align="left"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                              >
                                {item?.title}
                              </th>
                              <td className="flex justify-end px-6 py-4">
                                {getFormattedPrice(
                                  item?.amount?.value,
                                  item?.amount?.currency
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      <tr>
                        <td />
                        <td />
                        <td />
                        <td />
                        <td />
                        <th
                          scope="row"
                          align="left"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                          {t('Grand Total')}
                        </th>
                        <td className="flex justify-end px-6 py-4">
                          {getFormattedPrice(
                            GrandTotalPrice?.value,
                            GrandTotalPrice?.currency
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ErrorBoundary>
            ) : (
              <OrderviewPlaceholder />
            )}
          </div>
        );
      },
    },
  ];

  isValidArray(orderDetail?.shipments) &&
    items.push({
      id: items.length + 1,
      name: t('Shipments Details'),
      render: () => {
        return (
          <ErrorBoundary>
            {' '}
            <div className="py-5 lg:p-5">
              {loading ? (
                <OrderviewPlaceholder />
              ) : isValidArray(orderDetail?.shipments) ? (
                <ErrorBoundary>
                  <div className="flex items-center justify-between w-full gap-4 pb-5">
                    <Typography variant="subtitle1">
                      {' '}
                      {t('Shipment No:')} #{orderDetail?.shipments?.[0]?.number}
                    </Typography>
                    <Typography variant="body2">
                      {getFormattedDate(orderDetail?.order_date, 'dd/mm/yyyy')}
                    </Typography>
                  </div>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 rtl:text-right">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            {t('Product Name')}
                          </th>
                          <th scope="col" className="px-6 py-3">
                            {t('Quantity')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetail?.shipments?.[0]?.items?.map(
                          (orderItem: orderItemType, index: number) => (
                            <tr className="bg-white border-b" key={index}>
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                              >
                                {orderItem?.product_name}
                              </th>
                              <td className="px-6 py-4">
                                {orderItem?.quantity_shipped}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </ErrorBoundary>
              ) : (
                <ErrorBoundary>
                  <Typography
                    variant="h4"
                    component="h2"
                    className="px-5 py-10 text-center"
                  >
                    {t('Product not shipped yet check details later')}
                  </Typography>
                </ErrorBoundary>
              )}
            </div>
          </ErrorBoundary>
        );
      },
    });

  isValidArray(orderDetail?.invoices) &&
    items.push({
      id: items.length + 1,
      name: t('Invoice'),
      render: () => {
        return (
          <ErrorBoundary>
            {' '}
            <div className="py-5 lg:p-5">
              {loading ? (
                <OrderviewPlaceholder />
              ) : isValidArray(orderDetail?.invoices) ? (
                <ErrorBoundary>
                  <div className="flex items-center justify-between w-full gap-4 pb-5">
                    <Typography variant="subtitle1">
                      {' '}
                      {t('Invoice No:')} #{orderDetail?.invoices?.[0]?.number}
                    </Typography>
                    <Typography variant="body2">
                      {getFormattedDate(orderDetail?.order_date, 'dd/mm/yyyy')}
                    </Typography>
                  </div>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 rtl:text-right">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            {t('Product Name')}
                          </th>
                          <th scope="col" className="px-6 py-3">
                            {t('Quantity')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetail?.invoices?.[0]?.items?.map(
                          (orderItem: orderItemType, index: number) => (
                            <tr className="bg-white border-b" key={index}>
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                              >
                                {orderItem?.product_name}
                              </th>
                              <td className="px-6 py-4">
                                {orderItem?.quantity_invoiced}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </ErrorBoundary>
              ) : (
                <ErrorBoundary>
                  <Typography
                    variant="h4"
                    component="h2"
                    className="px-5 py-10 text-center"
                  >
                    {t('Product not invoiced yet check details later')}
                  </Typography>
                </ErrorBoundary>
              )}
            </div>
          </ErrorBoundary>
        );
      },
    });

  isValidObject(refunds) &&
    items.push({
      id: items.length + 1,
      name: t('Refunds'),
      render: () => {
        return (
          <ErrorBoundary>
            <div className="py-5 lg:p-5">
              {loading ? (
                <OrderviewPlaceholder />
              ) : isValidObject(refunds) ? (
                <ErrorBoundary>
                  <div className="flex items-center justify-between w-full gap-4 pb-5">
                    <Typography variant="subtitle1">
                      {' '}
                      {t('Refund No:')} #{refunds?.number}
                    </Typography>
                    <Typography variant="body2">
                      {getFormattedDate(orderDetail?.order_date, 'dd/mm/yyyy')}
                    </Typography>
                  </div>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 rtl:text-right">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            {t('Product Name')}
                          </th>
                          <th scope="col" className="px-6 py-3">
                            {t('Sku')}
                          </th>
                          <th />
                          <th />
                          <th scope="col" className="px-6 py-3">
                            {t('Price')}
                          </th>

                          <th scope="col" className="px-6 py-3">
                            {t('Quantity')}
                          </th>
                          <th scope="col" className="px-6 py-3">
                            {t('Total')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetail?.items?.map(
                          (orderItem: orderItemType, index: number) => (
                            <tr className="bg-white border-b" key={index}>
                              <th
                                scope="col"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                              >
                                {orderItem?.product_name}
                              </th>
                              <td className="grid gap-1.5 px-6 py-4">
                                {orderItem?.product_sku}
                              </td>
                              <td />
                              <td />
                              <td className="px-6 py-4">
                                {getFormattedPriceValue(orderItem)}
                              </td>

                              <td className="px-12 py-4">
                                {orderItem?.quantity_ordered}
                              </td>
                              <td className="px-6 py-4">
                                {calcSubtotal(orderItem)}
                              </td>
                            </tr>
                          )
                        )}

                        <tr>
                          <td />
                          <td />
                          <td />
                          <td />
                          <td />
                          <th
                            scope="row"
                            align="left"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                          >
                            {t('Subtotal')}
                          </th>
                          <td className="px-6 py-4">
                            {getFormattedPrice(
                              refundSubtotal.value,
                              refundSubtotal.currency
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td />
                          <td />
                          <td />
                          <td />
                          <td />
                          <th
                            scope="row"
                            align="left"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                          >
                            {t('Shipping')}
                          </th>
                          <td className="px-6 py-4">
                            {getFormattedPrice(
                              refundshipping?.value,
                              refundshipping?.currency
                            )}
                          </td>
                        </tr>
                        {isValidObject(refunddiscount) && (
                          <tr>
                            <td />
                            <td />
                            <td />
                            <td />
                            <td />
                            <th
                              scope="row"
                              align="left"
                              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                            >
                              {t('Discounts ({refunddiscount?.label})')}
                            </th>
                            <td className="px-6 py-4">
                              -{' '}
                              {getFormattedPrice(
                                refunddiscount?.amount?.value,
                                refunddiscount?.amount?.currency
                              )}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td />
                          <td />
                          <td />
                          <td />
                          <td />
                          <th
                            scope="row"
                            align="left"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                          >
                            {t('Grand Total')}
                          </th>
                          <td className="px-6 py-4">
                            {getFormattedPrice(
                              refundtotal?.value,
                              refundtotal?.currency
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </ErrorBoundary>
              ) : (
                <ErrorBoundary>
                  <Typography
                    variant="h4"
                    component="h2"
                    className="px-5 py-10 text-center"
                  >
                    {t('Product not refund yet check details later')}
                  </Typography>
                </ErrorBoundary>
              )}
            </div>
          </ErrorBoundary>
        );
      },
    });

  return (
    <ErrorBoundary>
      <Containers className="-lg:px-4">
        <div className="flex items-center justify-between gap-4 px-1.5 pb-5 lg:px-5">
          <div className="flex flex-row items-center gap-4">
            <Typography component="h1" variant="h4">
              {t('Order Detail')}
            </Typography>
            {!loading && (
              <Chip
                label={orderDetail?.status}
                style={{
                  borderRadius: '5px',
                  backgroundColor: '#EEEEEE',
                }}
              />
            )}
          </div>

          <ReOrderItem
            reorderClass="border border-solid border-secondary px-6 py-2 font-semibold"
            orderId={orderId}
          />
        </div>
        <span className="-lg:hidden">
          {loading ? <TabPlaceHolder /> : <Tab items={items} />}
        </span>
        <span className="px-6 lg:hidden">
          {loading ? <Placeholder /> : <MobileViewTab items={items} />}
        </span>

        {loading ? (
          <div className="w-full mt-5 h-60 animate-pulse bg-neutral-300" />
        ) : (
          <ErrorBoundary>
            <div className="flex flex-col">
              <div className="pt-6 pb-1 mx-2 border-0 border-b border-solid border-commonBorder">
                <Typography variant="h4" component="h2">
                  {t('Order Information')}
                </Typography>
              </div>
              <div className="items-start gap-4 mx-2 min-h-fit columns-2 justify-self-center">
                <div className="grid gap-4 break-inside-avoid">
                  {isValidObject(shippingAddress) && (
                    <div className="">
                      <Typography
                        variant="body1"
                        className="py-2.5 font-semibold tracking-tight"
                      >
                        {t('Shipping Address')}
                      </Typography>
                      <Typography variant="body2">
                        {shippingAddress?.firstname +
                          ' ' +
                          shippingAddress?.lastname}
                      </Typography>
                      <Typography variant="body2">
                        {shippingAddress?.company}
                      </Typography>
                      {shippingAddress?.street.map(
                        (lines: [], indexes: number) => (
                          <Typography variant="body2" key={indexes}>
                            {lines}
                          </Typography>
                        )
                      )}
                      <Typography variant="body2">
                        {shippingAddress?.city +
                          ', ' +
                          shippingAddress?.region +
                          ', ' +
                          shippingAddress?.postcode}
                      </Typography>
                      <Typography variant="body2">
                        {shippingAddress?.country_code &&
                          regionNames?.of(shippingAddress?.country_code)}
                      </Typography>
                      <Typography variant="body2">
                        {t('Tel:')} {shippingAddress?.telephone}
                      </Typography>
                    </div>
                  )}
                  <div className="">
                    <Typography
                      variant="body1"
                      className="py-2.5 font-semibold tracking-tight"
                    >
                      {t('Billing Address')}
                    </Typography>
                    <Typography variant="body2">
                      {billingAddress?.firstname +
                        ' ' +
                        billingAddress?.lastname}
                    </Typography>
                    <Typography variant="body2">
                      {billingAddress?.company}
                    </Typography>

                    {billingAddress?.street?.map(
                      (addressline: [], index: number) => (
                        <Typography variant="body2" key={index}>
                          {addressline}
                        </Typography>
                      )
                    )}

                    <Typography variant="body2">
                      {billingAddress?.city +
                        ', ' +
                        billingAddress?.region +
                        ', ' +
                        billingAddress?.postcode}
                    </Typography>
                    <Typography variant="body2">
                      {billingAddress?.country_code &&
                        regionNames?.of(billingAddress?.country_code)}
                    </Typography>
                    <Typography variant="body2">
                      {t('Tel:')} {billingAddress?.telephone}
                    </Typography>
                  </div>
                </div>
                {orderDetail?.shipping_method && (
                  <div className="break-inside-avoid">
                    <Typography
                      variant="body1"
                      className="py-2.5 font-semibold tracking-tight"
                    >
                      {t('Shipping Method')}
                    </Typography>
                    <Typography variant="body2">
                      {orderDetail?.shipping_method}
                    </Typography>
                  </div>
                )}
                <div className="break-inside-avoid">
                  <Typography
                    variant="body1"
                    className="py-2.5 font-semibold tracking-tight"
                  >
                    {' '}
                    {t('Payment Method')}
                  </Typography>
                  <Typography variant="body2">
                    {orderDetail?.payment_methods[0]?.name}
                  </Typography>
                </div>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </Containers>
    </ErrorBoundary>
  );
}

function MobileViewTab({ items }: { items: TabsProp[] }) {
  return (
    <Grid className="grid w-full gap-6">
      {items.map((item) => (
        <MobileViewDropdown
          key={item.id}
          item={item}
          extraClass="text-left -lg:max-w-[90vw] -sm:!max-w-[92vw]"
        />
      ))}
    </Grid>
  );
}

export default OrderView;
