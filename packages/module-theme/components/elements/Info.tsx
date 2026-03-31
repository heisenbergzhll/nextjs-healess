import { FC } from 'react';
import ErrorBoundary from '../ErrorBoundary';
type props = {
  heading: string;
  children: any;
  className?: string;
};
const Info: FC<props> = ({ heading, children, className }) => {
  return (
    <ErrorBoundary>
      <div
        className={`flex flex-col max-w-xl gap-[0.62rem] pb-5 mx-auto ${className}`}
      >
        <h2 className="leading-normal my-0 text-base md:text-[1.375rem] font-bold lg:leading-[1.65rem]">
          {heading}
        </h2>
        <p className="leading-normal my-0 text-[#64687A] text-[0.875rem] lg:leading-[1.25rem]">
          {children}
        </p>
      </div>
    </ErrorBoundary>
  );
};
export default Info;
