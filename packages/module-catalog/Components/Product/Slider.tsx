import { getFormattedPrice, isValidArray } from '@utils/Helper';
import { ProductItemInterface } from '@voguish/module-catalog/types';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import { decode } from 'base-64';

import { FEEDS_FRACTION } from '@utils/Constants';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Containers from '@voguish/module-theme/components/ui/Container';
import { InfoTextPlaceHolder } from '@voguish/module-theme/components/widgets/placeholders/InfoTextPlaceHolder';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRef } from 'react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Placeholder from './Item/Placeholder';
import Thumbnail from './Item/Thumbnail';

const Rating = dynamic(() => import('@mui/material/Rating'), {
  loading: () => (
    <div className="w-3 h-3 mr-1 bg-gray-200 rounded-sm animate-pulse" />
  ),
  ssr: false,
});
const AddToWishlist = dynamic(() => import('./Detail/AddToWishlist'));
const AddToCompare = dynamic(
  () => import('@voguish/module-compare/Components/AddToCompare')
);
const placeHolders = new Array(5).fill(0);

const Slider = ({
  product,
  extraClass = '',
  loading,
}: {
  product: ProductItemInterface | any;
  extraClass?: string;
  loading?: any;
  rightClass?: string;
}) => {
  const swiperRef = useRef<any>();
  return (
    <ErrorBoundary>
      <div
        className={`md:pl-0 -mb-5 max-w-[98vw] mx-auto 2xl:max-w-[91rem] product_card related_products ${isValidArray(product) && product.length > 3 && extraClass
          }`}
      >
        {loading ? (
          <Containers>
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
          </Containers>
        ) : (
          isValidArray(product) && (
            <div className="relative flex items-center h-full py-0 pl-6 mx-0 overflow-hidden cursor-pointer sm:pl-0 -3xs:px-6 sm:px-6 md:px-0 md:mx-auto">
              {/* {product.length > 3 && (
                <button
                  aria-label="slide left"
                  aria-describedby="left arrow"
                  className="relative z-10 items-center justify-center hidden bg-white border-0 rounded-full shadow-md cursor-pointer aspect-square min-w-12 h-11 max-w-min rtl:rotate-180 rtl:-left-5 ltr:left-5 md:flex max-h-fit"
                  onClick={() => swiperRef.current.slidePrev()}
                >
                  <BannerLeft />
                </button>
              )} */}

              <Swiper
                spaceBetween={10}
                navigation={false}
                modules={[Navigation]}
                slidesPerView={1}
                onBeforeInit={(swiper) => {
                  swiperRef.current = swiper;
                }}
                breakpoints={{
                  100: {
                    slidesPerView: 1,
                  },
                  375: {
                    slidesPerView: 1.5,
                  },
                  640: {
                    slidesPerView: 2,
                  },
                  // when window width is >= 768px
                  768: {
                    slidesPerView: 3,
                  },
                  // when window width is >= 1060px
                  1060: {
                    slidesPerView: 5,
                  },
                }}
                className="px-0 mx-0"
              >
                {product?.map((item: ProductItemInterface, index: number) => (
                  <SwiperSlide className="!z-0" key={item?.id || 0 + index}>
                    <article
                      className="cursor-pointer  max-w-[98%] -mx-px group relative h-[25rem]  duration-300 -z-10  text-left bg-[#fff]  w-80 min-h-full"
                    >
                      <div className="w-full !overflow-hidden !z-0  max-w-full   aspect-square truncate rounded-t-md">
                        <Link
                          className="w-full block !overflow-hidden"
                          href={`/catalog/product/${item?.url_key}`}
                        >
                          <div className="w-full block !overflow-hidden box-border border border-solid border-[#D2D2D2] rounded-2xl">
                            <Thumbnail
                              alt={item?.name}
                              thumbnail={
                                (item?.thumbnail?.thumbnail_url ??
                                  item?.thumbnail?.url) as string
                              }
                              fill
                              className="object-contain !static  hover:shadow-[0px_4px_24px_0px_rgba(0,_0,_0,_0.11)]   object-center  transition duration-500 cursor-pointer max-h-fit aspect-square md:object-scale-down group-hover:scale-110"
                            />
                          </div>

                        </Link>
                        <div>
                          <ErrorBoundary>
                            {item?.id && (
                              <AddToCompare
                                slider={
                                  item?.thumbnail?.thumbnail_url as string
                                }
                                productId={
                                  item?.id ? decode(`${item?.id}`) : 0
                                }
                                productSku={item?.sku}
                                detailsPage={false}
                              />
                            )}
                          </ErrorBoundary>
                          <ErrorBoundary>
                            {/* <AddToWishlist productSku={item?.sku} /> */}
                          </ErrorBoundary>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-3">
                        <ErrorBoundary>
                          <Rating
                            size="medium"
                            className="text-brand"
                            max={1}
                            defaultValue={
                              item?.rating_summary
                                ? item?.rating_summary / 100
                                : 0
                            }
                            precision={0.1}
                            readOnly
                          />
                        </ErrorBoundary>
                        <p className="text-neutral-900 text-sm my-0 font-semibold leading-[1.58rem] tracking-[0.0425rem]">
                          {(
                            (item?.rating_summary || 0) / FEEDS_FRACTION
                          ).toFixed(1)}
                        </p>
                      </div>
                      <div className="flex items-center my-2">
                        <p className=" text-black text-sm my-0 font-normal leading-[1.56rem] max-w-[100%] max-h-fit line-clamp-2">
                          {item?.name}
                        </p>
                      </div>
                      <footer className="flex items-start justify-between">
                        <ErrorBoundary>
                          <p className="text-black my-0 text-base font-semibold leading-6">
                            {getFormattedPrice(
                              item?.price_range?.maximum_price?.final_price
                                ?.value,
                              item?.price_range?.maximum_price?.final_price
                                ?.currency
                            )}
                          </p>
                        </ErrorBoundary>

                      </footer>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>
              {/* {product.length > 3 && (
                <button
                  aria-label="slide right"
                  aria-describedby="right arrow"
                  className="relative z-10 items-center justify-center hidden mx-0 bg-white border-0 rounded-full shadow-md cursor-pointer rtl:rotate-180 min-w-12 aspect-square rtl:-right-5 ltr:right-5 md:flex h-11 "
                  onClick={() => swiperRef.current?.slideNext()}
                >
                  <BannerRight />
                </button>
              )} */}
            </div>)
        )}
      </div>
    </ErrorBoundary>
  );
};
export default Slider;
