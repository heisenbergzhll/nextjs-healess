import { PLACEHOLDER_IMG } from '@utils/Constants';
import { BannerImage } from '@voguish/module-theme/types/home-page';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ErrorBoundary from '../../ErrorBoundary';

const Info = dynamic(() => import('../../elements/Info'));

const BrandCollectionBanner = ({
  items,
}: {
  items: { title: string; description: string; items: BannerImage[] };
}) => {
  const router = useRouter();
  const { locale } = router;
  const clipPathStyle = {
    clipPath:
      locale === 'ar'
        ? 'polygon(0 0, 100% 0%, 100% 100%, 15% 100%)'
        : 'polygon(0 0, 100% 0%, 83% 100%, 0% 100%)',
  };
  return (
    <ErrorBoundary>
      {' '}
      <div className="2xl:max-w-[90rem] mx-auto">
        <div className="pl-6 md:pl-2 lg:px-6">
          <ErrorBoundary>
            <Info className="!mx-0.5" heading={items?.title}>
              <span
                dangerouslySetInnerHTML={{
                  __html: items?.description,
                }}
              ></span>
            </Info>
          </ErrorBoundary>

          <div className="lg:grid lg:grid-cols-9 flex w-[93dvw] lg:w-auto lg:truncate overflow-y-hidden  overflow-x-auto lg:overflow-hidden snap-x gap-4 lg:grid-rows-2 h-[26.69rem] lg:h-[34.625rem]">
            {items?.items.map((item) => (
              <Link
                href={`/catalog/${item?.bannerType}/${item?.urlKey}`}
                key={item.id}
                className="h-full min-w-[80vw] no-underline lg:[&:nth-child(2)]:col-span-3 lg:[&:nth-child(3)]:col-span-3 lg:first:col-span-3 lg:last:col-span-3 cursor-pointer hover:scale-[0.99] duration-300 snap-start lg:w-full lg:min-w-full lg:[&:nth-child(3)]:row-span-2 lg:[&:nth-child(2)]:row-span-1 lg:last:row-span-1 lg:first:row-span-2 relative group"
              >
                <Image
                  src={item.url}
                  className="object-cover object-top w-full h-full"
                  width={600}
                  loading="lazy"
                  decoding="auto"
                  blurDataURL={PLACEHOLDER_IMG}
                  height={300}
                  alt={item.bannerTitle}
                />
                <div
                  style={{ backgroundColor: item?.dominantColor }}
                  className="absolute bottom-0 flex justify-between py-4 items-center mx-auto w-full rtl:pl-3.5 ltr:pr-3.5 text-white break-all backdrop-blur-md"
                >
                  <div
                    className="bg-slate-800 py-2 rtl:pr-2.5 ltr:pl-2.5 rtl:pl-8 ltr:pr-8  max-w-[50%] shrink-0 overflow-hidden"
                    style={clipPathStyle}
                  >
                    {' '}
                    <h2
                      className="text-sm my-0 overflow-hidden line-clamp-1 text-ellipsis xl:text-[1.125rem] italic font-semibold leading-5 text-white"
                      title={String(item?.bannerTitle || '')}
                    >
                      {item?.bannerTitle}
                    </h2>
                  </div>
                  <p
                    className="text-brand my-0 overflow-hidden text-ellipsis line-clamp-1 font-semibold text-4xl lg:text-[1.7rem] xl:text-[2.5125rem] 2xl:text-[2.8125rem] leading-[2.0625rem]"
                    title={String(item?.bannerSubtitle || '')}
                  >
                    {item?.bannerSubtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
export default BrandCollectionBanner;
