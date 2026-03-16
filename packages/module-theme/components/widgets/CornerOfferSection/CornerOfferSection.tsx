import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Typography from '@mui/material/Typography';
import { FC } from 'react';
import ErrorBoundary from '../../ErrorBoundary';

type Props = {
  title: string;
  content1: string;
  content2: string;
  className?: string;
  style: any;
};
const CornerOfferSection: FC<Props> = ({
  title,
  content1,
  content2,
  className,
  style,
}) => {
  return (
    <ErrorBoundary>
      <div
        style={style}
        className={`cursor-pointer rounded-2xl flex flex-col  items-start gap-y-4 pl-8 py-6  text-center ${className}`}
      >
        {content2 && (
          <Typography component="p" className="uppercase leading-normal text-xs font-bold">
            {content2}
          </Typography>
        )}
        <div className="text-left">
          {title && (
            <Typography
              component="h2"
              className="text-4xl font-Lexend font-bold text-white"
            >
              {title}
            </Typography>
          )}
          {content1 && (
            <Typography
              component="h2"
              className="text-4xl font-Lexend font-bold text-white"
            >
              {content1}
            </Typography>
          )}
        </div>
        <footer>
          <button className="flex items-center gap-1 text-white px-1  border-0 border-b border-solid border-white bg-transparent  transition">
            <span className="font-bold text-base">Shop</span>
            <ArrowOutwardIcon fontSize="small" />
          </button>
        </footer>


      </div>
    </ErrorBoundary>
  );
};
export default CornerOfferSection;
