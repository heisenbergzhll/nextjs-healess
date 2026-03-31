import Grid from '@mui/material/Grid';
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
      {' '}
      <Grid
        item
        xs={4}
        md={3}
        sx={{
          transition: 'transform 0.3s, border 0.3s',
          '&:hover': {
            boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.11)',
            transform: 'scale(0.95)',
          },
        }}
        lg={2}
        paddingY={2}
        paddingX={1}
        textAlign="center"
        style={style}
        className={`cursor-pointer flex flex-col items-center justify-center ${className}`}
      >
        {title && (
          <Typography
            component="h2"
            className="leading-normal "
            variant="subtitle1"
          >
            {title}
          </Typography>
        )}
        {content1 && (
          <Typography
            component="h3"
            variant="subtitle2"
            className="italic leading-normal"
            sx={{ fontWeight: 300 }}
          >
            {content1}
          </Typography>
        )}
        {content2 && (
          <Typography component="p" variant="h2" className="leading-normal">
            {content2}
          </Typography>
        )}
      </Grid>
    </ErrorBoundary>
  );
};
export default CornerOfferSection;
