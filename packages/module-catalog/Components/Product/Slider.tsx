import { getFormattedPrice, isValidArray } from '@utils/Helper';
import { ProductItemInterface } from '@voguish/module-catalog/types';
import { decode } from 'base-64';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import BannerLeft from '@packages/module-theme/components/elements/BannerLeft';
import BannerRight from '@packages/module-theme/components/elements/BannerRight';
import { FEEDS_FRACTION } from '@utils/Constants';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { HTMLRenderer } from '@voguish/module-theme/components/HTMLRenderer';
import Containers from '@voguish/module-theme/components/ui/Container';
import { InfoTextPlaceHolder } from '@voguish/module-theme/components/widgets/placeholders/InfoTextPlaceHolder';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRef } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
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
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <ErrorBoundary>
      <div
        className={`md:pl-0 -mb-5 max-w-[98vw] mx-auto 2xl:max-w-[91rem] product_card related_products ${
          isValidArray(product) && product.length > 3 && extraClass
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
              <div className="md:hidden">
                <Placeholder />
              </div>
            </ErrorBoundary>
          </Containers>
        ) : (
          isValidArray(product) && (
            <div className="relative w-full px-1 sm:px-0 md:px-0 md:mx-auto">
              <button
                ref={prevRef}
                aria-label="slide left"
                className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center bg-white border-0 rounded-full shadow-md cursor-pointer aspect-square min-w-12 max-w-min h-11"
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <BannerLeft />
              </button>

              <div className="flex-1 min-w-0 [&_.swiper]:!overflow-visible md:[&_.swiper]:!overflow-hidden">
                <Swiper
                  grabCursor
                  observer
                  observeParents
                  rewind={true}
                  navigation={false}
                  centerInsufficientSlides={true}
                  modules={[Navigation]}
                  onBeforeInit={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  breakpoints={{
                    0: {
                      slidesPerView: 1.1,
                      spaceBetween: 12,
                    },
                    375: {
                      slidesPerView: 1.15,
                      spaceBetween: 12,
                    },
                    480: {
                      slidesPerView: 1.6,
                      spaceBetween: 14,
                    },
                    640: {
                      slidesPerView: 2.15,
                      spaceBetween: 16,
                    },
                    768: {
                      slidesPerView: 3,
                      spaceBetween: 20,
                    },
                    1060: {
                      slidesPerView: 4,
                      spaceBetween: 24,
                    },
                  }}
                  className="w-full"
                >
                  {product
                    ?.slice(0, 10)
                    ?.map((item: ProductItemInterface, index: number) => (
                      <SwiperSlide
                        key={item?.id || index}
                        className="!z-0 h-auto"
                      >
                        <article className="grid cursor-pointer w-full h-full group hover:shadow-[0px_4px_24px_0px_rgba(0,0,0,0.11)] duration-300 border-solid grid-rows-[min-content,43px,1fr] text-left bg-white rounded-md border gap-4 border-[#D2D2D2]">
                          {/* Image */}
                          <div className="w-full overflow-hidden border-b border-[#D2D2D2] relative h-[19.8rem] rounded-t-md">
                            <Link
                              href={`/catalog/product/${item?.url_key}`}
                              className="block w-full h-full"
                            >
                              <Thumbnail
                                alt={item?.name}
                                thumbnail={
                                  (item?.thumbnail?.thumbnail_url ??
                                    item?.thumbnail?.url) as string
                                }
                                fill
                                className="object-contain object-center transition duration-500 cursor-pointer md:object-scale-down group-hover:scale-110 rounded-t-xl"
                              />
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
                                <AddToWishlist productSku={item?.sku} />
                              </ErrorBoundary>
                            </div>
                          </div>

                          {/* Name */}
                          <div className="flex items-center px-4">
                            <p className="text-black text-lg my-0 font-normal leading-[1.56rem] max-w-[80%] max-h-fit line-clamp-2">
                              <HTMLRenderer
                                className="my-0"
                                htmlText={item?.name}
                              />
                            </p>
                          </div>

                          <footer className="flex items-start justify-between px-4 pb-4">
                            <ErrorBoundary>
                              <p className="text-black my-0 text-[1.375rem] font-semibold leading-[1.97rem]">
                                {getFormattedPrice(
                                  item?.price_range?.maximum_price?.final_price
                                    ?.value,
                                  item?.price_range?.maximum_price?.final_price
                                    ?.currency
                                )}
                              </p>
                            </ErrorBoundary>
                            <div className="flex items-center mt-0.5 gap-1">
                              <ErrorBoundary>
                                <Rating
                                  size="medium"
                                  className="text-brand"
                                  max={1}
                                  defaultValue={
                                    item?.rating_summary
                                      ? item.rating_summary / 100
                                      : 0
                                  }
                                  precision={0.1}
                                  readOnly
                                />
                              </ErrorBoundary>
                              <p className="mt-0.5 text-neutral-900 text-[1.25rem] my-0 font-normal leading-[1.58rem] tracking-[0.0425rem]">
                                {(
                                  (item?.rating_summary || 0) / FEEDS_FRACTION
                                ).toFixed(1)}
                              </p>
                            </div>
                          </footer>
                        </article>
                      </SwiperSlide>
                    ))}
                </Swiper>
              </div>

              <button
                ref={nextRef}
                aria-label="slide right"
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center bg-white border-0 rounded-full shadow-md cursor-pointer w-11 h-11 rtl:rotate-180"
                onClick={() => swiperRef.current?.slideNext()}
              >
                <BannerRight />
              </button>
            </div>
          )
        )}
      </div>
    </ErrorBoundary>
  );
};
export default Slider;
