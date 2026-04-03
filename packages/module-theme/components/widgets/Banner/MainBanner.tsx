import { PLACEHOLDER_IMG } from '@utils/Constants';
import { isValidObject } from '@utils/Helper';
import Thumbnail from '@voguish/module-catalog/Components/Product/Item/Thumbnail';
import { BannerImage } from '@voguish/module-theme/types/home-page';
import Link from 'next/link';
import ErrorBoundary from '../../ErrorBoundary';
import { MainBannerPlaceHolder } from '../placeholders/MainBannerPlaceHolder';

const MainBanner = ({ bannerData }: { bannerData: BannerImage }) => {
  return (
    <ErrorBoundary>
      {isValidObject(bannerData) ? (
        <div
          style={{ backgroundColor: bannerData?.dominantColor }}
          className="relative flex items-center justify-between w-full px-6 mx-auto truncate py-7 md:py-11"
        >
          <div className="md:border-2 md:border-[#BBD8DE] py-8 md:px-5 md:border-solid md:bg-[#fff] w-full">
            <div className="w-full max-w-[48%]">
              <h2 
                className="text-2xl md:text-5xl my-0 lg:text-[3.44rem] font-semibold leading-6 md:leading-[3.5625rem] text-black overflow-hidden text-ellipsis line-clamp-1">
                {bannerData?.bannerTitle}
              </h2>
              <h2 
                className="text-base md:text-[2rem] my-0 font-normal mt-3.5 md:mt-7 uppercase leading-normal text-[#262441] overflow-hidden text-ellipsis line-clamp-1"
                title={String(bannerData?.bannerSubtitle || '')}
              >
                {bannerData?.bannerSubtitle}
              </h2>
              <h2 
                className="text-[#163564] text-xl my-0 md:text-6xl lg:text-8xl font-extrabold leading-6 md:leading-[4.375rem] md:mt-0.5 overflow-hidden text-ellipsis line-clamp-1"
                title={String(bannerData?.bannerDesc || '')}
              >
                {bannerData?.bannerDesc}
              </h2>
              <Link
                href={`/catalog/${bannerData?.bannerType}/${bannerData?.urlKey}`}
                className="decoration-[none] no-underline"
              >
                <button className="py-3 border-0 hover:bg-blend-darken cursor-pointer hover:shadow-lg hover:scale-[1.005] duration-200 md:py-3.5 text-base font-semibold mt-1 md:mt-4 leading-normal text-white px-6 md:px-9 bg-brand hover:bg-hoverButton">
                  {bannerData?.buttonText}
                </button>
              </Link>
            </div>
          </div>
          <div
            style={{ backgroundColor: bannerData?.dominantColor }}
            className="absolute rtl:left-0 ltr:right-0 outline-0 flex w-full justify-center hover:shadow-md hover:scale-[1.01] duration-300 max-w-[75%] md:max-w-[62%] h-full rtl:-translate-x-28 rtl:xl:-translate-x-36 ltr:translate-x-28 ltr:xl:translate-x-36 rtl:-skew-x-[-26deg] ltr:skew-x-[-26deg] shadow-[0px_-16px_15px_rgba(0,_0,_0,_0.2)]"
          >
            <Thumbnail
              alt={bannerData?.bannerTitle}
              fill
              priority={true}
              thumbnail={bannerData?.url || PLACEHOLDER_IMG}
              className="object-contain aspect-video relative rtl:sm:mr-8 rtl:lg:mr-20 ltr:-xs:ml-7 ltr:ml-5 ltr:md:mx-auto rtl:max-w-[50%] rtl:md:max-w-[70%] ltr:max-w-[50%] rtl:-skew-x-[26deg] ltr:skew-x-[26deg] h-[88%]"
            />
          </div>
        </div>
      ) : (
        <MainBannerPlaceHolder />
      )}
    </ErrorBoundary>
  );
};
export default MainBanner;
