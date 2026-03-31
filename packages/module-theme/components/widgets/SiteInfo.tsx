import Thumbnail from '@voguish/module-catalog/Components/Product/Item/Thumbnail';
import ErrorBoundary from '../ErrorBoundary';

interface Benefit {
  id?: string | number | undefined;
  title: string;
  iconImgUrl: string;
  subtitle: string;
}

const SiteInfo = ({ items }: { items: Benefit[] | any }) => {
  return (
    <ErrorBoundary>
      {' '}
      <div className="2xl:max-w-[90rem] lg:mx-auto">
        <div className="py-11 px-6 lg:rtl:odd:divide-y-0 lg:ltr:even:divide-y-0 gap-y-6 ltr:lg:divide-x rtl:lg:even:divide-x justify-start lg:justify-center lg:divide-y-0 lg:divide-solid lg:divide-[#d2d2d2]  text-black grid sm:grid-cols-2 lg:grid-cols-4  [&:nth-child(2)]:min-h-[16.68rem]">
          {items?.map((item: Benefit, index: number) => (
            <div
              key={item?.id || 0 + index}
              className="flex items-center gap-4 py-2 md:px-5 xl:px-3 2xl:px-5"
            >
              <div className="relative w-12 h-12">
                <Thumbnail
                  className="object-contain"
                  loading="lazy"
                  fill
                  thumbnail={item?.iconImgUrl}
                  alt={item?.title}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-black text-[1.125rem] leading-[0.9375rem] my-0 font-normal">
                  {item.title}
                </h2>
                <p className="text-[#64687a] text-sm font-normal my-0">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};
export default SiteInfo;
