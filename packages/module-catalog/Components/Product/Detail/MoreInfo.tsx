import { useQuery } from '@apollo/client';
import Typography from '@mui/material/Typography';
import { isValidArray } from '@utils/Helper';
import PRODUCTS_QUERY from '@voguish/module-catalog/graphql/MoreInfo.graphql';
import { HTMLRenderer } from '@voguish/module-theme/components/HTMLRenderer';
import { useTranslation } from 'next-i18next';

const MoreInfo = ({ productSku }: { productSku: string }) => {
  const { data, loading } = useQuery(PRODUCTS_QUERY, {
    variables: { filters: { sku: { eq: productSku } } },
  });
  const products = data?.products?.items?.[0] || [];
  // Placeholders for Product List
  const arr = new Array(4).fill(0);
  const { t } = useTranslation('common');

  return (
    <article className="flex flex-col gap-4">
      {loading &&
        arr?.map(
          (item, index) =>
            item?.visible_on_front && (
              <div
                key={item + index}
                className="items-center w-full gap-3 columns-5"
              >
                <div className="w-full h-1 rounded-md animate-pulse bg-neutral-200" />
                <div className="w-full h-1 rounded-md animate-pulse bg-neutral-200" />
              </div>
            )
        )}
      {!loading && isValidArray(products?.attributeValues) ? (
        products?.attributeValues?.map(
          (item: {
            visible_on_front: boolean;
            code: number | string;
            label: string;
            value: string;
          }) =>
            item?.visible_on_front && item?.code !== 'price' && item?.label?.toLowerCase() !== 'price' && (
              <hgroup
                key={item?.code}
                className="items-center w-full gap-3 columns-5"
              >
                {loading ? (
                  <div className="w-full h-1 rounded-md animate-pulse bg-neutral-200" />
                ) : (
                  <h3 className="my-0 text-lg font-medium">{item.label}</h3>
                )}
                <p className="col-span-4 my-0 text-base font-normal">
                  <HTMLRenderer htmlText={item.value} />
                </p>
              </hgroup>
            )
        )
      ) : (
        <Typography
          variant="filter"
          className="leading-normal text-hoverEffect lg:leading-[1.25rem]"
        >
          {' '}
          {t('No More Information Is Available For This Product')}
        </Typography>
      )}
    </article>
  );
};

export default MoreInfo;
