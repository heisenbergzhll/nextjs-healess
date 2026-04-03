import { isValidArray } from '@utils/Helper';
import Placeholder from '@voguish/module-catalog/Components/Product/Item/Placeholder';
import Slider from '@voguish/module-catalog/Components/Product/Slider';
import dynamic from 'next/dynamic';
import ErrorBoundary from '../../ErrorBoundary';
import { InfoTextPlaceHolder } from '../placeholders/InfoTextPlaceHolder';

const Info = dynamic(() => import('../../elements/Info'));
const FeatureProducts = ({ data, loading }: { data: any; loading: any }) => {
  return (
    <div className="pb-4">
      <ErrorBoundary>
        {loading ? (
          <InfoTextPlaceHolder extraClasses="mx-auto" />
        ) : (
          isValidArray(data?.productList) && (
            <span className="max-w-xl mx-auto text-center">
              <Info heading={data?.title} className="px-4 text-center">
                <span
                  dangerouslySetInnerHTML={{
                    __html: data?.description,
                  }}
                ></span>
              </Info>
            </span>
          )
        )}
        {loading ? (
          <div className="2xl:max-w-[90rem] mx-auto">
            <span className="pt-4">
              <div className="hidden md:flex">
                {new Array(5).fill(0).map((item, index) => (
                  <div className="w-[20%]" key={`${index + item}`}>
                    <Placeholder />
                  </div>
                ))}
              </div>
              <div className="md:hidden">
                <Placeholder />
              </div>
            </span>
          </div>
        ) : isValidArray(data?.productList) ? (
          <ErrorBoundary>
            <Slider
              extraClass="explore-product"
              product={data?.productList || []}
            />
          </ErrorBoundary>
        ) : (
          ''
        )}
      </ErrorBoundary>
    </div>
  );
};
export default FeatureProducts;
