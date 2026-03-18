import Typography from '@mui/material/Typography';
import Thumbnail from '@voguish/module-catalog/Components/Product/Item/Thumbnail';
import ErrorBoundary from '../ErrorBoundary';

interface Benefit {
  id?: string | number | undefined;
  name: string;
  icon: string;
  count: string;
  bgcolor: string;
}

const CategoryCard = ({ items }: { items: Benefit[] | any }) => {
  return (
    <ErrorBoundary>
      <div className="2xl:max-w-[90rem] max-w-[100vw] lg:mx-auto w-full px-4 lg:px-[6.625rem]">
        <Typography variant='subtitle2' className="text-xl font-bold">Shop by Department</Typography>
        <div className="w-full min-w-0 py-6 gap-y-2 lg:gap-y-6 justify-start lg:justify-center text-black grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1 lg:gap-6">
          {items?.map((item: Benefit, index: number) => (
            <div
              key={item?.id || 0 + index}
              style={{ backgroundColor: item.bgcolor }}
              className={`flex flex-col justify-center items-center cursor-pointer box-border  gap-2 lg:gap-4  py-4 lg:py-8 md:px-5 xl:px-3 2xl:px-5 rounded-2xl border !border-solid border-[#F3F4F6] hover:border-brand hover:!bg-[#FFF4EA] `}
            >
              <div className="flex items-center justify-center text-center relative w-12  h-12 rounded-full bg-gray-50">
                <Thumbnail
                  className="object-contain w-7 h-7"
                  loading="lazy"
                  width={28}
                  height={28}
                  thumbnail={item?.icon}
                  alt={item?.name}
                />
              </div>
              <div className="flex flex-col gap-2.5 lg:gap-4 text-center px-2">
                <h2 className="text-black text-sm hover:font-bold lg:text-[1.125rem] leading-[0.9375rem] my-0 font-semibold">
                  {item.name}
                </h2>
                <p className="text-[#4A5565] text-sm font-normal my-0">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#4A5565] mr-2"></span>
                  {item.count} items
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};
export default CategoryCard;
