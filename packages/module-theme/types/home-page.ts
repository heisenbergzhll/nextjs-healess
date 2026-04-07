import { ProductItemInterface } from '@voguish/module-catalog/types';
import { ReactNode } from 'react';

export interface BannerImage {
  id: number;
  content: string;
  name: string | null | undefined;
  url: string;
  bannerTitle: string;
  bannerDesc: string;
  buttonText: string;
  bannerSubtitle: ReactNode;
  bannerType: string;
  dominantColor: string;
  urlKey: string;
  infoPosition?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  bannerData: {
    bannerNameType: string;
    bannerType:
    | 'main_banner'
    | 'new_collection_banner'
    | 'product_collection_banner'
    | 'promotion_banner'
    | 'brand_collection_banner'
    | 'shopping_collection_banner';
    dominantColor: string;
    id: number;
    name: string;
    url: string;
    buttonText?: string;
    bannerSubtitle: string;
    bannerTitle: string;
    bannerDesc: string;
    content?: string;
    urlKey: string;
    exploreProductCarousel: {
      id?: string;
      title: string;
      description: string;
      hotDealsProductList: [ProductItemInterface];
      topRatedProductList: [ProductItemInterface];
      topSellingProductList: [ProductItemInterface];
    };
  };
}
export interface ExploreProductCarousel {
  id?: string;
  title: string;
  description: string | any;
  hotDealsProductList: [ProductItemInterface];
  topRatedProductList: [ProductItemInterface];
  topSellingProductList: [ProductItemInterface];
}
export interface ProductList {
  sku: string;
}

export interface CategoryList {
  urlKey: string;
}

export interface Carousel {
  appearance?: 'layout_1' | 'layout_2' | 'layout_3';
  categoryList?: [CategoryList];
  description?: string;
  dominantColor: string;
  id: string;
  image: string;
  label: string;
  productList?: [ProductList];
  top_rated?: [ProductList];
  top_selling: [ProductList];
  type: string;
}
export interface RecentlyViewedProduct {
  title: string;
  description: string;
  productList: Carousel[];
}
export interface HomePageData {
  getHomePageData: {
    benefits: {
      id?: number | string;
      title: string;
      iconImgUrl: string;
      subtitle: string;
    };
    cornerOffers: {
      description: string;
      title: string;
      items: {};
    };
    mainBanner: BannerImage[];
    newCollectionBanner: BannerImage[];

    promotionBanner: BannerImage[];
    featuredProductCarousel: { productList: Carousel[] };
    exploreProductCarousel: ExploreProductCarousel;
    recentlyViewedProduct: RecentlyViewedProduct;
    bannerImages: BannerImage[];
    carousel: Carousel[];
    sortOrder: [{ sectionId: string; sortOrder: number }];
    productCollectionBanner: BannerImage[];
    shoppingCollectionBanner: {
      title: string;
      description: string;
      items: BannerImage[];
    };
    brandCollectionBanner: {
      title: string;
      description: string;
      items: BannerImage[];
    };
  };
}

export interface HomePageDataQueryResult {
  getHomePageData: HomePageData;
}
