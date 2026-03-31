import { PLACEHOLDER_IMG } from '@utils/Constants';
import { BannerImage } from '@voguish/module-theme/types/home-page';
import Image from 'next/image';
import Link from 'next/link';
import Info from '../../elements/Info';
import ErrorBoundary from '../../ErrorBoundary';


const getPositionClasses = (position?: string): string => {
  if (!position) {
    return 'group-first:bottom-5 group-first:left-5 group-first:lg:mx-auto group-[&:nth-child(2)]:top-[16%] group-[&:nth-child(2)]:left-10 group-[&:nth-child(3)]:top-[15%] group-[&:nth-child(3)]:right-10 group-last:top-[15%] group-last:right-10';
  }

  const positionMap: Record<string, string> = {
    'top-left': 'top-5 left-5',
    'top-center': 'top-5 left-1/2 -translate-x-1/2',
    'top-right': 'top-5 right-5',
    'center-left': 'top-1/2 -translate-y-1/2 left-5',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'center-right': 'top-1/2 -translate-y-1/2 right-5',
    'bottom-left': 'bottom-5 left-5',
    'bottom-center': 'bottom-5 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-5 right-5',
  };

  return positionMap[position] || 'bottom-5 left-5'; // Default to bottom-left
};

const ShoppingBanner = ({
  items,
}: {
  items: { title: string; description: string; items: BannerImage[] };
}) => {
  /**
   * Image Alt
   */

  return (
    <ErrorBoundary>
      {' '}
      <div className="2xl:max-w-[90rem] mx-auto">
        <div className="pl-6 md:pl-2 lg:px-6">
          <Info className="!mx-0.5" heading={items?.title}>
            <span
              dangerouslySetInnerHTML={{
                __html: items?.description,
              }}
            ></span>
          </Info>

          <div className="lg:grid lg:grid-cols-11 w-[93dvw] lg:w-full flex overflow-y-hidden lg:truncate overflow-x-auto lg:overflow-hidden snap-x gap-5 lg:grid-rows-2 h-[21.4rem] lg:h-[30.625rem]">
            {items?.items.map((item) => (
              <div
                key={item.id}
                className="rounded-[0.625rem] first:lg:col-span-3 shadow-[inset_0_4px_8px_0_rgb(0_0_0_/_0.05)] hover:scale-[0.99] duration-300 h-full snap-start  min-w-[80vw] lg:w-full lg:min-w-full lg:[&:nth-child(3)]:row-span-1 lg:[&:nth-child(2)]:col-span-8 lg:[&:nth-child(3)]:col-span-4  lg:last:col-span-4 lg:last:row-span-1 lg:first:row-span-2 relative group"
              >
                <Image
                  src={item.url}
                  className="object-cover object-center w-full h-full rounded-md"
                  width={390}
                  decoding="auto"
                  loading="lazy"
                  blurDataURL={PLACEHOLDER_IMG}
                  height={485}
                  alt={item.bannerTitle}
                />
                <div
                  style={{ backgroundColor: item?.dominantColor }}
                  className={`absolute grid w-2/3 backdrop-blur-sm backdrop-hue-rotate-15 backdrop-contrast-100 backdrop-brightness-110 backdrop-saturate-[1.2] shadow-(0_8px_32px_0_rgb(0_0_0_/_18%)) rounded-md break-all group-first:px-5 group-first:py-4 group-first:w-[88%] group-[&:nth-child(2)]:p-4 group-[&:nth-child(2)]:md:w-1/3 group-[&:nth-child(3)]:p-6 group-[&:nth-child(3)]:md:max-w-fit group-last:p-6 group-last:max-w-fit ${getPositionClasses(item?.infoPosition)}`}
                >
                  <h2 
                    className="first:text-[#191919] my-0 overflow-hidden text-ellipsis line-clamp-2 text-xl tracking-wider font-semibold leading-normal group-[&:nth-child(2)]:text-black group-[&:nth-child(2)]text-xl group-[&:nth-child(3)]:text-base group-last:text-base group-[&:nth-child(3)]:tracking-[0.038rem] group-last:tracking-[0.038rem] group-[&:nth-child(3)]:leading-[1.33rem] group-last:leading-[1.33rem] group-[&:nth-child(3)]:uppercase group-last:uppercase group-[&:nth-child(3)]:font-bold group-last:font-bold"
                    title={item?.bannerTitle}
                  >
                    {item?.bannerTitle}
                  </h2>
                  <p 
                    className="group-first:text-black max-h-min my-0 overflow-hidden text-ellipsis group-first:font-bold group-first:text-4xl group-first:leading-normal group-first:tracking-[0.1rem] group-[&:nth-child(3)]:text-black group-[&:nth-child(3)]:font-bold group-[&:nth-child(3)]:text-[1.625rem]   group-[&:nth-child(3)]:leading-normal group-[&:nth-child(3)]:tracking-[0.1rem] group-last:text-black group-last:font-bold group-last:text-[1.625rem] group-last:leading-normal group-last:tracking-[0.1rem] group-[&:nth-child(2)]:text-black group-[&:nth-child(2)]:font-bold group-[&:nth-child(2)]:text-[2.81rem] line-clamp-2 group-[&:nth-child(2)]:leading-normal group-[&:nth-child(2)]tracking-[0.1rem]"
                    title={`${item?.bannerSubtitle || ''}`}
                  >
                    {item?.bannerSubtitle}
                    <span 
                      className="text-black px-2 text-xl my-0 leading-normal font-bold tracking-[0.1rem]"
                      title={item?.bannerDesc}
                    >
                      {item?.bannerDesc}
                    </span>
                  </p>
                  <div className="group-first:pt-[0.44rem] cta max-w-fit group-[&:nth-child(3)]:pt-[2.12rem] group-last:pt-[2.12rem] group-[&:nth-child(2)]:pt-1">
                    <Link
                      className="text-[1.0625rem] leading-normal my-0 py-0 hover-underline-animation tracking-[0.038rem] line-clamp-2 font-bold text-brand uppercase"
                      href={`/catalog/${item.bannerType}/${item?.urlKey}`}
                    >
                      {item?.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
export default ShoppingBanner;
