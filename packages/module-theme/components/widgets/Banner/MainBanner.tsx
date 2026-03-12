import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import BestSellerSlider from '~packages/module-theme/components/widgets/BestSellerSlider';
import ErrorBoundary from '../../ErrorBoundary';

type StaticBanner = {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  itemsText: string;
  imageSrc: string;
};

const STATIC_BANNERS: StaticBanner[] = [
  {
    id: 'spf',
    title: 'SPF Got You Covered',
    description: 'Fresh drops curated for the season. Discover new favorites today.',
    buttonText: 'Explore Now',
    itemsText: '77 items',
    imageSrc: '/assets/img/products/test/test.jpg',
  },
  {
    id: 'new-in',
    title: 'Shop the Marvis Collection',
    description: "A wide range of the Italian toothpaste including limited edition flavours that you’ll love for brighter smiles everyday",
    buttonText: 'Explore Now',
    itemsText: '42 items',
    imageSrc: '/assets/img/products/test/test2.png',
  }
];
const STATIC_BANNERS_2: StaticBanner[] = [
  {
    id: 'spf',
    title: 'iPad 13” (2025) (Refurbished)',
    description: 'Starting at £399',
    buttonText: 'Explore Now',
    itemsText: 'Trending',
    imageSrc: '/assets/img/products/test/ipad.jpg',
  },
  {
    id: 'new-in',
    title: 'iPhone 15 Pro Max (Refurbished)',
    description: 'Starting at £499',
    buttonText: 'Explore Now',
    itemsText: 'Trending',
    imageSrc: '/assets/img/products/test/iphone.png',
  }
];
const STATIC_PRODUCT: any[] = [
  {
    "__typename": "ProductItem",
    "url_key": "anastasia-beverly-hills-brow-definer-blonde",
    "sku": "U_ANASTASIABEVERLYHILLS_689304044103",
    "name": "Anastasia Beverly Hills - Brow Definer #Blonde (0.2g)",
    "brand": "Anastasia",
    "thumbnail": {
      "__typename": "ProductImage",
      "url": "https://www.haitaoweb.com/media/catalog/product/u/_/u_anastasiabeverlyhills_689304044103.jpg",
      "label": "Anastasia Beverly Hills - Brow Definer #Blonde (0.2g)"
    },
    "price_range": {
      "__typename": "PriceRange",
      "maximum_price": {
        "__typename": "ProductPrice",
        "final_price": {
          "__typename": "Money",
          "currency": "GBP",
          "value": 24.99
        }
      }
    }
  },
  {
    "__typename": "ProductItem",
    "url_key": "251922433560494",
    "sku": "U_BRAUN_4022167110206_DAMAGED",
    "name": "Braun - Nasal Aspirator Filters (x20)",
    "brand": "Braun",
    "thumbnail": {
      "__typename": "ProductImage",
      "url": "https://www.haitaoweb.com/media/catalog/product/8/3/8396_1.png",
      "label": "Braun - Nasal Aspirator Filters (x20)"
    },
    "price_range": {
      "__typename": "PriceRange",
      "maximum_price": {
        "__typename": "ProductPrice",
        "final_price": {
          "__typename": "Money",
          "currency": "GBP",
          "value": 4.15
        }
      }
    }
  },
  {
    "__typename": "ProductItem",
    "url_key": "clarins-nutri-lumiere-partners-set",
    "sku": "U_CLARINS_3380810474206_SET",
    "name": "Clarins - Nutri-Lumiere Partners Set",
    "brand": "Clarins",
    "thumbnail": {
      "__typename": "ProductImage",
      "url": "https://www.haitaoweb.com/media/catalog/product/n/u/nutri_set.jpg",
      "label": "Clarins - Nutri-Lumiere Partners Set"
    },
    "price_range": {
      "__typename": "PriceRange",
      "maximum_price": {
        "__typename": "ProductPrice",
        "final_price": {
          "__typename": "Money",
          "currency": "GBP",
          "value": 175.99
        }
      }
    }
  },
  {
    "__typename": "ProductItem",
    "url_key": "173057091695208",
    "sku": "U_FLORAVITAL_4004148017179",
    "name": "Floradix - Floravital Herbal Iron and Vitamin Formula Yeast Free (250ml)",
    "brand": "Floradix",
    "thumbnail": {
      "__typename": "ProductImage",
      "url": "https://www.haitaoweb.com/media/catalog/product/0/_/0_32_426.png",
      "label": "Floradix - Floravital Herbal Iron and Vitamin Formula Yeast Free (250ml)"
    },
    "price_range": {
      "__typename": "PriceRange",
      "maximum_price": {
        "__typename": "ProductPrice",
        "final_price": {
          "__typename": "Money",
          "currency": "GBP",
          "value": 13.99
        }
      }
    }
  },
  {
    "__typename": "ProductItem",
    "url_key": "roc-soleil-protect-moisturising-spray-lotion-spf50-200ml-27379",
    "sku": "U_ROC_1210000800060",
    "name": "RoC - Soleil-Protect Moisturising Spray Lotion SPF50 (200ml)",
    "brand": "RoC",
    "thumbnail": {
      "__typename": "ProductImage",
      "url": "https://www.haitaoweb.com/media/catalog/product/s/c/screenshot_2023-03-29_163114.jpg",
      "label": "RoC - Soleil-Protect Moisturising Spray Lotion SPF50 (200ml)"
    },
    "price_range": {
      "__typename": "PriceRange",
      "maximum_price": {
        "__typename": "ProductPrice",
        "final_price": {
          "__typename": "Money",
          "currency": "GBP",
          "value": 20.99
        }
      }
    }
  }
];
const MainBanner = () => {
  return (
    <ErrorBoundary>
      <div className="flex gap-4 w-full max-w-[90rem] px-[6.625rem] mx-auto py-[50px]">
        <div className="relative w-[484px] h-[484px] cursor-pointer">
          <Swiper
            className="main_banner h-full"
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            loop={true}
            speed={800}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
            }}
          >
            {STATIC_BANNERS.map((banner) => (
              <SwiperSlide key={banner.id} className="w-full h-full ">
                <div className="relative w-full h-full rounded-[10px]">
                  <Image
                    src={banner.imageSrc}
                    alt={banner.title}
                    fill
                    priority={banner.id === STATIC_BANNERS[0]?.id}
                    className="object-cover rounded-xl"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent rounded-[10px]" />
                  <div className="absolute inset-x-0 bottom-0 px-8 pb-16">
                    <h2 className="m-0 font-Lexend text-white text-2xl leading-tight font-medium">
                      {banner.title}
                    </h2>
                    <p className="mt-3 mb-0 text-white/90 text-base leading-relaxed max-w-[28rem]">
                      {banner.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        className="inline-flex items-center cursor-pointer border-none gap-2 rounded-full bg-black px-7 py-3 text-white font-semibold backdrop-blur-sm transition hover:bg-black/65"
                        aria-label={banner.buttonText}
                      >
                        <span>{banner.buttonText}</span>
                        <ArrowOutwardIcon fontSize="small" />
                      </button>
                      <div className="flex items-center gap-1 text-white/90">
                        <span className="text-sm font-light">{banner.itemsText}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="relative w-[356px] h-[484px] cursor-pointer">
          <Swiper
            className="main_banner h-full"
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            loop={true}
            speed={800}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
            }}
          >
            {STATIC_BANNERS_2.map((banner) => (
              <SwiperSlide key={banner.id} className="w-full h-full ">
                <div className="relative w-full h-full rounded-[10px]">
                  <Image
                    src={banner.imageSrc}
                    alt={banner.title}
                    fill
                    priority={banner.id === STATIC_BANNERS[0]?.id}
                    className="object-cover rounded-xl"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent rounded-[10px]" />
                  <div className="absolute inset-x-0 bottom-0 pl-8 pr-5 pb-16">
                    <p className="inline-block rounded-xl text-white/70  px-2 bg-[#747474]/80  text-sm leading-relaxed">
                      {banner.description}
                    </p>
                    <h2 className="m-0 mt-3  w-full font-Lexend text-white text-xl leading-tight font-medium whitespace-nowrap">
                      {banner.title}
                    </h2>

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        className="inline-flex items-center cursor-pointer border-none gap-2 rounded-full bg-black px-7 py-3 text-white font-semibold backdrop-blur-sm transition hover:bg-black/65"
                        aria-label={banner.buttonText}
                      >
                        <span>{banner.buttonText}</span>
                        <ArrowOutwardIcon fontSize="small" />
                      </button>

                      <div className="flex items-center gap-1 text-white/90">
                        <TrendingUpIcon fontSize="small" />
                        <span className="text-sm font-light">{banner.itemsText}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="relative w-[356px] h-[484px] cursor-pointer">
          <div className="relative w-full h-[234px] rounded-[10px]">
            <div className="absolute bg-[#000]/70 w-full h-full z-10  rounded-[10px]" />
            <Image
              src="assets/img/products/test/women.png"
              alt={"Unineed"}
              fill
              className="object-cover rounded-xl"
            />
            <div className="absolute p-8 flex flex-col justify-between w-full h-full z-20 rounded-[10px]">
              <div className="font-Lexend text-white">
                <h4 className="m-0 text-3xl font-medium">Women’s Day Sale </h4>
                <p className="mt-2 font-normal text-base">20% off on all women’s products</p>
              </div>
              <div>
                <p className="text-xs font-normal text-white/80">Use the coupon code below for a 20% off</p>
                <button className="bg-brand mt-3 flex items-center gap-1  px-3 py-1 text-white rounded-lg border-none">
                  <span className="text-xs uppercase font-medium">WOMENSDAY20</span>
                  <ContentCopyIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>
          <div className="relative w-full h-[234px] rounded-[10px] shadow-md mt-4">
            <ErrorBoundary>
              {/* <Slider
                extraClass="explore-product"
                product={products?.hotDealsProductList}
              /> */}
              <BestSellerSlider
                extraClass="bestseller-product"
                product={STATIC_PRODUCT}
              />

            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
export default MainBanner;
