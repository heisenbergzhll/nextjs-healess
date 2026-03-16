import { isValidArray } from '@utils/Helper';
import { PromtionPlaceHolder } from '@voguish/module-theme/components/widgets/placeholders/PromtionPlaceHolder';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { lazy, memo, ReactNode, Suspense, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import Containers from '../components/ui/Container';
import { InfoTextPlaceHolder } from '../components/widgets/placeholders/InfoTextPlaceHolder';
import { MainBannerPlaceHolder } from '../components/widgets/placeholders/MainBannerPlaceHolder';
import { SiteInfoPlaceholder } from '../components/widgets/placeholders/SiteInfoPlaceholder';
import { HomePageData } from '../types/home-page';
import FeaturedFall, { ExploreFall, RecentFall } from './Fallback/FeaturedFall';

// Dynamic imports
const RecentlyViewed = dynamic(
  () => import('../components/widgets/RecentlyViewed'),
  { ssr: false }
);
const ExploreProducts = dynamic(
  () => import('../components/widgets/ExploreProducts'),
  { ssr: false }
);
const FeatureProducts = dynamic(
  () => import('../components/widgets/FeatureProducts'),
  { ssr: false }
);
const Info = dynamic(() => import('../components/elements/Info'), {
  loading: () => <InfoTextPlaceHolder />,
  ssr: false,
});
const CornerOffer = dynamic(
  () => import('../components/widgets/CornerOfferSection'),
  { loading: () => <MainBannerPlaceHolder />, ssr: false }
);
const MainBanner = lazy(
  () => import('../components/widgets/Banner/MainBanner')
);
const SiteInfo = dynamic(() => import('../components/widgets/SiteInfo'), {
  ssr: false,
});
const CategoryCard = dynamic(() => import('../components/widgets/CategoryCard'), {
  ssr: false,
});

const BannerSlide = dynamic(() => import('../Layout/HomeItems/BannerSlide'), {
  ssr: false,
});
const PromotionBanner = dynamic(
  () => import('../components/widgets/Banner/PromotionBanner'),
  { ssr: false }
);
const NewCollectionBanner = dynamic(
  () => import('../components/widgets/Banner/NewCollectionBanner'),
  { ssr: false }
);
const ShoppingBanner = dynamic(
  () => import('../components/widgets/Banner/ShoppingBanner'),
  { ssr: false }
);
const HomeOfferSection = dynamic(
  () => import('../Layout/HomeItems/HomeOfferSection'),
  { ssr: false }
);
const Recommended = dynamic(
  () => import('../components/widgets/Recommended'),
  { ssr: false }
);
const HomePage = ({ pageData }: { pageData: HomePageData }) => {
  console.log('pageData', pageData);
  const loading = false;
  const items = pageData?.getHomePageData;

  const [recentRef, recentInView] = useInView({
    triggerOnce: true,
    rootMargin: '200px',
  });
  const [benefitsRef, benefitsInView] = useInView({
    triggerOnce: true,
    rootMargin: '300px',
  });
  const [cornerRef, cornerInView] = useInView({
    triggerOnce: true,
    rootMargin: '300px',
  });
  const [brandColl, brandCollView] = useInView({
    triggerOnce: true,
    rootMargin: '200px',
  });

  const sortedSections = useMemo(() => {
    return items?.sortOrder || [];
  }, [items]);

  const CONST_CATEGORY = [
    {
      name: 'Skincare',
      count: 1156,
      icon: '/assets/icons/category/skincare.svg',
    },
    {
      name: 'Makeup',
      count: 842,
      icon: '/assets/icons/category/makeup.svg',
    },
    {
      name: 'Fragrance',
      count: 523,
      icon: '/assets/icons/category/fragrance.svg',
    },
    {
      name: 'Haircare',
      count: 376,
      icon: '/assets/icons/category/haircare.svg',
    },
    {
      name: 'Accessories',
      count: 211,
      icon: '/assets/icons/category/accessories.svg',
    },
    {
      name: 'iPad',
      count: 64,
      icon: '/assets/icons/category/ipad.svg',
    },
  ];


  const SECTION_COMPONENTS: Record<string, (item: any) => ReactNode> = {
    mainBanner: (item) => (
      <Suspense key={item.sortOrder} fallback={<MainBannerPlaceHolder />}>
        <MainBanner />
      </Suspense>
    ),
    // 原有的
    // promotionBanner: (item) => (
    //   <Suspense key={item.sortOrder} fallback={<PromtionPlaceHolder />}>
    //     {isValidArray(items?.promotionBanner) && (
    //       <PromotionBanner items={items.promotionBanner} />
    //     )}
    //   </Suspense>
    // ),
    promotionBanner: (item) => (
      <Suspense key={item.sortOrder} fallback={<PromtionPlaceHolder />}>
        <CategoryCard items={CONST_CATEGORY} />
      </Suspense>
    ),
    featuredProductCarousel: (item) =>
      isValidArray(items?.featuredProductCarousel?.productList) ? (
        <Suspense key={item.sortOrder} fallback={<FeaturedFall />}>
          <FeatureProducts
            data={items.featuredProductCarousel}
            loading={loading}
          />
        </Suspense>
      ) : null,

    // newCollectionBanner: (item) => (
    //   <Suspense key={item.sortOrder} fallback={<MainBannerPlaceHolder />}>
    //     {isValidObject(items?.newCollectionBanner?.[0]) && (
    //       <div
    //         style={{
    //           backgroundColor: items.newCollectionBanner[0]?.dominantColor,
    //         }}
    //       >
    //         <NewCollectionBanner bannerData={items.newCollectionBanner[0]} />
    //       </div>
    //     )}
    //   </Suspense>
    // ),

    exploreProductCarousel: (item) =>
      isValidArray(items?.exploreProductCarousel?.topRatedProductList) &&
        isValidArray(items?.exploreProductCarousel?.hotDealsProductList) &&
        isValidArray(items?.exploreProductCarousel?.topSellingProductList) ? (
        <Suspense key={item.sortOrder} fallback={<ExploreFall />}>
          <ExploreProducts
            products={items.exploreProductCarousel}
            homeLoading={loading}
          />
          {/* {isValidArray(items?.productCollectionBanner) && (
            <BannerSlide
              loading={loading}
              items={items.productCollectionBanner}
            />
          )} */}
        </Suspense>
      ) : null,

    // shoppingCollectionBanner: (item) => (
    //   <Suspense key={item.sortOrder} fallback={<ShoppingBannerPlaceHolder />}>
    //     {isValidArray(items?.shoppingCollectionBanner?.items) && (
    //       <ShoppingBanner items={items.shoppingCollectionBanner} />
    //     )}
    //   </Suspense>
    // ),

    // productCollectionBanner: (item) => (
    //   <Suspense key={item.sortOrder} fallback={<MainBannerPlaceHolder />}>
    //     {isValidArray(items?.productCollectionBanner) && (
    //       <BannerSlide
    //         loading={loading}
    //         items={items.productCollectionBanner}
    //       />
    //     )}
    //   </Suspense>
    // ),

    cornerOffers: (item) =>
      isValidArray(items?.cornerOffers?.items) && (
        <div ref={cornerRef} key={item.sortOrder}>
          {cornerInView && (
            <div className="2xl:max-w-[90rem] px-4 lg:px-[6.625rem]  mx-auto">
              <div>
                <CornerOffer items={items.cornerOffers} />
              </div>
            </div>
          )}
        </div>
      ),

    // brandCollectionBanner: (item) =>
    //   isValidArray(items?.brandCollectionBanner?.items) && (
    //     <div ref={brandColl} key={item.sortOrder}>
    //       {brandCollView && (
    //         <motion.div
    //           initial={{ y: 10, opacity: 0 }}
    //           animate={{ y: 0, opacity: 1 }}
    //           exit={{ y: -10, opacity: 0 }}
    //           transition={{ duration: 0.2 }}
    //         >
    //           <Suspense fallback={<BrandCollectionPlaceHolder />}>
    //             <HomeOfferSection
    //               brandCollectionBanner={items.brandCollectionBanner}
    //               loading={loading}
    //             />
    //           </Suspense>
    //         </motion.div>
    //       )}
    //     </div>
    //   ),

    recentlyViewedProduct: (item) =>
      isValidArray(items?.recentlyViewedProduct?.productList) && (
        <div ref={recentRef} key={item.sortOrder}>
          {recentInView && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<RecentFall />}>
                <RecentlyViewed
                  products={items.recentlyViewedProduct}
                  homeLoading={loading}
                />
              </Suspense>
            </motion.div>
          )}
        </div>
      ),

    benefits: (item) =>
      isValidArray(items?.benefits) && (
        <div ref={benefitsRef} key={item.sortOrder}>
          {benefitsInView && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense
                fallback={
                  <Containers>
                    <SiteInfoPlaceholder />
                  </Containers>
                }
              >
                <SiteInfo items={items.benefits} />
              </Suspense>
            </motion.div>
          )}
        </div>
      ),
  };

  const renderedSections: React.ReactNode[] = [];
  const renderedSet = new Set<string>();

  sortedSections.forEach((item) => {
    const sectionId = item.sectionId;
    if (renderedSet.has(sectionId)) return;
    const renderer = SECTION_COMPONENTS[sectionId];
    if (renderer) {
      renderedSections.push(renderer(item));
      renderedSet.add(sectionId);
    }
  });

  return (
    <div className="grid mx-auto bg-white gap-y-10 lg:gap-y-16 max-w-[125rem]">
      {renderedSections}
      <Recommended
        products={items?.recentlyViewedProduct}
        homeLoading={loading}
      />
    </div>
  );
};

function areEqual(
  prevProps: { pageData: HomePageData },
  nextProps: { pageData: HomePageData }
) {
  return (
    JSON.stringify(prevProps.pageData) === JSON.stringify(nextProps.pageData)
  );
}

export default memo(HomePage, areEqual);
