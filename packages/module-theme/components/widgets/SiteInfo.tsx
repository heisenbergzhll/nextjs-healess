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
      <div className="2xl:max-w-[90rem] px-4 lg:px-[6.625rem] sm:px-4 lg:mx-auto">
        <div className="py-6  gap-y-2.5  lg:gap-y-6 ltr:lg:divide-x rtl:lg:even:divide-x justify-start lg:justify-center  text-black grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-6">
          {items?.map((item: Benefit, index: number) => (
            <div
              key={item?.id || 0 + index}
              className="flex flex-col justify-center items-center gap-2.5 lg:gap-6  py-4 lg:py-8 md:px-5 xl:px-3 2xl:px-5 shadow-md rounded-2xl border border-solid border-slate-100"
            >
              <div className="flex items-center justify-center text-center relative w-16  h-14 rounded-[16px] bg-[#EFF6FF]">
                <Thumbnail
                  className="object-contain w-7 h-7"
                  loading="lazy"
                  width={28}
                  height={28}
                  thumbnail={item?.iconImgUrl}
                  alt={item?.title}

                />
              </div>
              <div className="flex flex-col gap-2.5 lg:gap-6 text-center px-2">
                <h2 className="text-black text-base lg:text-[1.125rem] leading-[0.9375rem] my-0 font-medium">
                  {item.title}
                </h2>
                <p className="text-[#62748E] text-sm font-normal my-0">
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
