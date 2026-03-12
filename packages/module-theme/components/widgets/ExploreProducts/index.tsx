import { isValidArray, isValidObject } from '@utils/Helper';
import { ExploreProductCarousel } from '@voguish/module-theme/types/home-page';

import Placeholder from '@voguish/module-catalog/Components/Product/Item/Placeholder';
import Slider from '@voguish/module-catalog/Components/Product/Slider';
import { TabsProp } from '@voguish/module-catalog/types';
import Tab from '@voguish/module-theme/components/widgets/Tab';
import { useTranslation } from 'next-i18next';
import Info from '../../elements/Info';
import ErrorBoundary from '../../ErrorBoundary';
import { InfoTextPlaceHolder } from '../placeholders/InfoTextPlaceHolder';

const ExploreProducts = ({
  products,
  homeLoading,
}: {
  products: ExploreProductCarousel;
  homeLoading: any;
}) => {
  const { t } = useTranslation('common');

  const placeHolders = new Array(5).fill(0);
  console.log('products?.topRatedProductList', products?.topRatedProductList)
  const item =
    isValidArray(products?.topRatedProductList) &&
    isValidArray(products?.hotDealsProductList) &&
    isValidArray(products?.topSellingProductList);
  const items: TabsProp[] = [
    {
      id: 1,
      name: t('Top Deals'),
      render: () => {
        return (
          <ErrorBoundary>
            {' '}
            <div className="py-4 ltr:-ml-5">
              {isValidObject(products) && (
                <Slider
                  extraClass="explore-product"
                  product={products?.hotDealsProductList}
                />
              )}
            </div>
          </ErrorBoundary>
        );
      },
    },
    {
      id: 2,
      name: t('Top Rated'),
      render: () => {
        return (
          <ErrorBoundary>
            <div className="py-4 ltr:-ml-5">
              {' '}
              {isValidObject(products) && (
                <Slider
                  product={products?.topRatedProductList}
                  extraClass="explore-product"
                />
              )}
            </div>
          </ErrorBoundary>
        );
      },
    },
    {
      id: 3,
      name: t('Top Selling'),
      render: () => {
        return (
          <ErrorBoundary>
            <div className="py-4 ltr:-ml-5">
              {isValidObject(products) && (
                <Slider
                  extraClass="explore-product"
                  product={products?.topSellingProductList}
                />
              )}
            </div>
          </ErrorBoundary>
        );
      },
    },
  ];

  return (
    <div>
      {homeLoading ? (
        <ErrorBoundary>
          <InfoTextPlaceHolder extraClasses="mx-auto" />
          <ErrorBoundary>
            <div className="hidden md:flex">
              {placeHolders.map((item, index) => (
                <div className="w-[20%]" key={`${index + item}`}>
                  <Placeholder />
                </div>
              ))}
            </div>
            <div className=" md:hidden">
              <Placeholder />
            </div>
          </ErrorBoundary>
        </ErrorBoundary>
      ) : (
        <div>
          {item && (
            <ErrorBoundary>
              <Info
                className="px-4 -mb-4 text-center"
                heading={products?.title}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: products?.description,
                  }}
                ></span>
              </Info>
            </ErrorBoundary>
          )}
          <Tab className="!border-none" right={false} items={items} />
        </div>
      )}
    </div>
  );
};

export default ExploreProducts;
