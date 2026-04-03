import Grid from '@mui/material/Grid';
import dynamic from 'next/dynamic';
import ErrorBoundary from '../../ErrorBoundary';
const CornerOfferSection = dynamic(() => import('./CornerOfferSection'));

const CornerOffer = ({ items }: any) => {
  return (
    <ErrorBoundary>
      <Grid container className="py-0 my-0 md:px-2.5 lg:px-0">
        {items?.items.map((data: any) => (
          <CornerOfferSection
            key={data?.id}
            title={data.title}
            content1={data.subtitle}
            content2={data.description}
            style={{
              backgroundColor: `${data?.backgroundColor}`,
              color: `${data?.textColor}`,
            }}
          />
        ))}
      </Grid>
    </ErrorBoundary>
  );
};
export default CornerOffer;
