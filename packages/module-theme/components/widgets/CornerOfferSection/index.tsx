import dynamic from 'next/dynamic';
import ErrorBoundary from '../../ErrorBoundary';
const CornerOfferSection = dynamic(() => import('./CornerOfferSection'));

const CornerOffer = ({ items }: any) => {
  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </ErrorBoundary>
  );
};
export default CornerOffer;
