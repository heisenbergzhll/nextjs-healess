import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { getFormattedPrice, isValidArray } from '@utils/Helper';
import { ProductItemInterface } from '@voguish/module-catalog/types';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import BannerLeft from '@packages/module-theme/components/elements/BannerLeft';
import BannerRight from '@packages/module-theme/components/elements/BannerRight';
import { FEEDS_FRACTION } from '@utils/Constants';
import Thumbnail from '@voguish/module-catalog/Components/Product//Item/Thumbnail';
import Placeholder from '@voguish/module-catalog/Components/Product/Item/Placeholder';
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

const Rating = dynamic(() => import('@mui/material/Rating'), {
  loading: () => (
    <div className="w-3 h-3 mr-1 bg-gray-200 rounded-sm animate-pulse" />
  ),
  ssr: false,
});
const AddToWishlist = dynamic(() => import('@voguish/module-catalog/Components/Product/Detail/AddToWishlist'));
const AddToCompare = dynamic(
  () => import('@voguish/module-compare/Components/AddToCompare')
);
const placeHolders = new Array(5).fill(0);

const BestSellerSlider = ({
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
        className={`md:pl-0  w-[356px] h-[234px]`}
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
            <div className="relative flex items-center w-[356px] h-[234px] cursor-pointer">


              <Swiper
                navigation={false}
                modules={[Navigation, Pagination]}
                slidesPerView={1}
                onBeforeInit={(swiper) => {
                  swiperRef.current = swiper;
                }}
                pagination={{
                  clickable: true,
                  renderBullet: function (index: number, className: string) {
                    return `<span class="${className}"></span>`;
                  },
                }}
                className="best_seller_slider px-0 mx-0  w-[356px] h-[234px] rounded-[10px]"
              >
                {product
                  ?.slice(0, 10)
                  ?.map((item: ProductItemInterface, index: number) => (
                    <SwiperSlide className="!z-0 w-full h-full bg-gray-100 rounded-[10px]" key={item?.id || 0 + index}>
                      <div className="flex p-4 gap-4 relative">
                        <Link
                          href={`/catalog/product/${item?.url_key}`}
                          className="!w-[80px] !h-[80px] block bg-white"
                        >
                          <Thumbnail
                            alt={item?.name}
                            height={80}
                            width={80}
                            thumbnail={
                              (item?.thumbnail?.thumbnail_url ??
                                item?.thumbnail?.url) as string
                            }
                            className="!w-[80px] !h-[80px] object-contain border border-solid border-[#D2D2D2] object-center transition duration-500 cursor-pointer aspect-square md:object-scale-down rounded-sm"
                          />
                        </Link>
                        <div className="flex-1">
                          <div className="font-Lexend">
                            <p className="font-medium text-sm">{item.brand}</p>
                            <p className=" text-black text-sm my-0 font-normal leading-[1.25rem] max-h-fit line-clamp-2">
                              {item?.name}
                            </p>
                          </div>
                          <footer className="flex items-start justify-between ">
                            <ErrorBoundary>
                              <div className="flex gap-1">
                                <p className="font-Lexend text-black my-0 text-sm leading-[1.97rem]">
                                  {getFormattedPrice(
                                    item?.price_range?.maximum_price?.final_price
                                      ?.value,
                                    item?.price_range?.maximum_price?.final_price
                                      ?.currency
                                  )}
                                </p>
                                <p className="font-Lexend text-[#90A1B9] line-through my-0 text-sm leading-[1.97rem]">
                                  {getFormattedPrice(
                                    item?.price_range?.maximum_price?.final_price
                                      ?.value + 10,
                                    item?.price_range?.maximum_price?.final_price
                                      ?.currency
                                  )}
                                </p>
                              </div>
                            </ErrorBoundary>
                            <div className="flex items-center mt-0.5 gap-1">
                              <ErrorBoundary>
                                <Rating
                                  size="medium"
                                  className="text-[#EBC326]"
                                  max={1}
                                  defaultValue={
                                    item?.rating_summary
                                      ? item?.rating_summary / 100
                                      : 1
                                  }
                                  precision={0.1}
                                  readOnly
                                />
                              </ErrorBoundary>
                              <p className="mt-0.5 text-black/20 text-sm my-0 font-normal leading-[1.58rem] tracking-[0.0425rem]">
                                {(
                                  (item?.rating_summary || 0) / FEEDS_FRACTION
                                ).toFixed(1)}
                              </p>
                            </div>
                          </footer>
                          <ErrorBoundary>
                            <div className="flex gap-2 mt-4">
                              <AddToWishlist productSku={item?.sku} />
                              <button className="font-Lexend flex  items-center justify-center rounded-2xl gap-1 w-[118px] h-[26px] border border-solid border-black bg-white">
                                <ShoppingCartIcon fontSize="small" />
                                <span className="text-sm font-normal">Add to bag</span>
                              </button>
                            </div>
                          </ErrorBoundary>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
              </Swiper>
              {product.length > 3 && (
                <button
                  aria-label="slide left"
                  aria-describedby="left arrow"
                  className="absolute bottom-[16px] z-10 items-center justify-center hidden bg-white rounded-full  border border-solid border-gray-600 cursor-pointer aspect-square min-w-12 h-11 max-w-min rtl:rotate-180 rtl:-left-10 ltr:left-10 md:flex max-h-fit"
                  onClick={() => swiperRef.current.slidePrev()}
                >
                  <BannerLeft />
                </button>
              )}

              {product.length > 3 && (
                <button
                  aria-label="slide right"
                  aria-describedby="right arrow"
                  className="absolute bottom-[16px] z-10 items-center justify-center hidden mx-0 bg-white rounded-full border border-solid border-gray-600 cursor-pointer rtl:rotate-180 min-w-12 aspect-square rtl:-right-10 ltr:right-10 md:flex h-11 "
                  onClick={() => swiperRef.current?.slideNext()}
                >
                  <BannerRight />
                </button>
              )}
            </div>)
        )}
      </div>
    </ErrorBoundary>
  );
};
export default BestSellerSlider;
