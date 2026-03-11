import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Popper from '@mui/material/Popper';
import { isValidArray, isValidObject } from '@utils/Helper';
import { MenuIcon } from '@voguish/module-theme/components/elements/Icon';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Containers from '@voguish/module-theme/components/ui/Container';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { FormattedMenuItem } from './types';

type MenuItem = Record<string, FormattedMenuItem>;
type MegaMenuProps = {
  menuItems: MenuItem;
  activeMenus: string[];
};

type Category = {
  title: string;
  url_key: string;
  image_url: string;
  item_id: string | number;
  position?: number;
  children?: MenuItem;
};

export default function MegaMenu({ menuItems, activeMenus }: MegaMenuProps) {
  const anchorEl = useRef(null);
  // const a = {
  //   "__typename": "MenuItem",
  //   "title": "Skincare",
  //   "parent_id": 41,
  //   "image_url": "https://www.haitaoweb.com/media/catalog/category/file_1.jpg",
  //   "position": 2,
  //   "path": "1/41/42",
  //   "item_id": 42,
  //   "url_key": "skincare",
  //   "children": {
  //     "68": {
  //       "__typename": "MenuItem",
  //       "title": "Face Care",
  //       "parent_id": 42,
  //       "image_url": "",
  //       "position": 1,
  //       "path": "1/41/42/68",
  //       "item_id": 68,
  //       "url_key": "face-care-products",
  //       "children": {
  //         "341": {
  //           "__typename": "MenuItem",
  //           "title": "Moisturisers",
  //           "parent_id": 68,
  //           "image_url": "",
  //           "position": 8,
  //           "path": "1/41/42/68/341",
  //           "item_id": 341,
  //           "url_key": "face-cream-moisturisers",
  //           "children": {}
  //         },
  //         "342": {
  //           "__typename": "MenuItem",
  //           "title": "Cleanser",
  //           "parent_id": 68,
  //           "image_url": "",
  //           "position": 1,
  //           "path": "1/41/42/68/342",
  //           "item_id": 342,
  //           "url_key": "face-cleansers-toners-makeup-removers",
  //           "children": {}
  //         },
  //         "343": {
  //           "__typename": "MenuItem",
  //           "title": "Treatment",
  //           "parent_id": 68,
  //           "image_url": "",
  //           "position": 5,
  //           "path": "1/41/42/68/343",
  //           "item_id": 343,
  //           "url_key": "treatments-for-face-care",
  //           "children": {}
  //         },
  //         "344": {
  //           "__typename": "MenuItem",
  //           "title": "Toner",
  //           "parent_id": 68,
  //           "image_url": "",
  //           "position": 2,
  //           "path": "1/41/42/68/344",
  //           "item_id": 344,
  //           "url_key": "face-toners",
  //           "children": {}
  //         },
  //         "346": {
  //           "__typename": "MenuItem",
  //           "title": "Eye Care",
  //           "parent_id": 68,
  //           "image_url": "",
  //           "position": 6,
  //           "path": "1/41/42/68/346",
  //           "item_id": 346,
  //           "url_key": "eye-care-products-anti-ageing-eye-creams",
  //           "children": {}
  //         },
  //         "347": {
  //           "__typename": "MenuItem",
  //           "title": "Lip Care",
  //           "parent_id": 68,
  //           "image_url": "",
  //           "position": 10,
  //           "path": "1/41/42/68/347",
  //           "item_id": 347,
  //           "url_key": "lip-care-products",
  //           "children": {}
  //         },
  //         "364": {
  //           "__typename": "MenuItem",
  //           "title": "Neck and Decollette",
  //           "parent_id": 68,
  //           "image_url": "",
  //           "position": 4,
  //           "path": "1/41/42/68/364",
  //           "item_id": 364,
  //           "url_key": "neck-and-decollette",
  //           "children": {}
  //         },
  //         "365": {
  //           "__typename": "MenuItem",
  //           "title": "Exfoliators",
  //           "parent_id": 68,
  //           "image_url": "",
  //           "position": 11,
  //           "path": "1/41/42/68/365",
  //           "item_id": 365,
  //           "url_key": "exfoliators",
  //           "children": {}
  //         },
  //         "397": {
  //           "__typename": "MenuItem",
  //           "title": "For Him",
  //           "parent_id": 68,
  //           "image_url": "",
  //           "position": 14,
  //           "path": "1/41/42/68/397",
  //           "item_id": 397,
  //           "url_key": "skincare-face-care-for-him",
  //           "children": {}
  //         },
  //         "450": {
  //           "__typename": "MenuItem",
  //           "title": "Face Masks",
  //           "parent_id": 68,
  //           "image_url": "",
  //           "position": 3,
  //           "path": "1/41/42/68/450",
  //           "item_id": 450,
  //           "url_key": "face-masks",
  //           "children": {}
  //         }
  //       }
  //     },
  //     "69": {
  //       "__typename": "MenuItem",
  //       "title": "Body Care",
  //       "parent_id": 42,
  //       "image_url": "",
  //       "position": 2,
  //       "path": "1/41/42/69",
  //       "item_id": 69,
  //       "url_key": "bodycare-shop-online",
  //       "children": {
  //         "345": {
  //           "__typename": "MenuItem",
  //           "title": "Sun Care SPF & UV Protection",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 6,
  //           "path": "1/41/42/69/345",
  //           "item_id": 345,
  //           "url_key": "self-tanning-lotions-and-sun-protection-products",
  //           "children": {}
  //         },
  //         "348": {
  //           "__typename": "MenuItem",
  //           "title": "Hand Care",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 5,
  //           "path": "1/41/42/69/348",
  //           "item_id": 348,
  //           "url_key": "handcare-footcare-creams-lotions",
  //           "children": {}
  //         },
  //         "361": {
  //           "__typename": "MenuItem",
  //           "title": "Bath and Shower",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 2,
  //           "path": "1/41/42/69/361",
  //           "item_id": 361,
  //           "url_key": "skincare-body-bath-and-shower",
  //           "children": {}
  //         },
  //         "362": {
  //           "__typename": "MenuItem",
  //           "title": "Moisturisers",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 3,
  //           "path": "1/41/42/69/362",
  //           "item_id": 362,
  //           "url_key": "body-moisturisers",
  //           "children": {}
  //         },
  //         "396": {
  //           "__typename": "MenuItem",
  //           "title": "Treatment",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 8,
  //           "path": "1/41/42/69/396",
  //           "item_id": 396,
  //           "url_key": "skincare-treatment",
  //           "children": {}
  //         },
  //         "403": {
  //           "__typename": "MenuItem",
  //           "title": "Dental Care",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 9,
  //           "path": "1/41/42/69/403",
  //           "item_id": 403,
  //           "url_key": "dental-care",
  //           "children": {
  //             "517": {
  //               "__typename": "MenuItem",
  //               "title": "Toothbrush Heads",
  //               "parent_id": 403,
  //               "image_url": "",
  //               "position": 2,
  //               "path": "1/41/42/69/403/517",
  //               "item_id": 517,
  //               "url_key": "toothbrush-heads",
  //               "children": {}
  //             },
  //             "519": {
  //               "__typename": "MenuItem",
  //               "title": "Airfloss",
  //               "parent_id": 403,
  //               "image_url": "",
  //               "position": 1,
  //               "path": "1/41/42/69/403/519",
  //               "item_id": 519,
  //               "url_key": "airfloss",
  //               "children": {}
  //             }
  //           }
  //         },
  //         "406": {
  //           "__typename": "MenuItem",
  //           "title": "Shaving",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 10,
  //           "path": "1/41/42/69/406",
  //           "item_id": 406,
  //           "url_key": "men-and-women-shavers",
  //           "children": {}
  //         },
  //         "446": {
  //           "__typename": "MenuItem",
  //           "title": "Electrical Toothbrushes",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 12,
  //           "path": "1/41/42/69/446",
  //           "item_id": 446,
  //           "url_key": "electrical-toothbrushes",
  //           "children": {}
  //         },
  //         "490": {
  //           "__typename": "MenuItem",
  //           "title": "Self Tan",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 7,
  //           "path": "1/41/42/69/490",
  //           "item_id": 490,
  //           "url_key": "self-tan",
  //           "children": {}
  //         },
  //         "505": {
  //           "__typename": "MenuItem",
  //           "title": "Hair Removal",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 11,
  //           "path": "1/41/42/69/505",
  //           "item_id": 505,
  //           "url_key": "hair-removal",
  //           "children": {}
  //         },
  //         "514": {
  //           "__typename": "MenuItem",
  //           "title": "Foot Care",
  //           "parent_id": 69,
  //           "image_url": "",
  //           "position": 13,
  //           "path": "1/41/42/69/514",
  //           "item_id": 514,
  //           "url_key": "foot-care",
  //           "children": {}
  //         }
  //       }
  //     },
  //     "89": {
  //       "__typename": "MenuItem",
  //       "title": "Gift Sets",
  //       "parent_id": 42,
  //       "image_url": "",
  //       "position": 5,
  //       "path": "1/41/42/89",
  //       "item_id": 89,
  //       "url_key": "skincare-gift-sets",
  //       "children": {}
  //     },
  //     "112": {
  //       "__typename": "MenuItem",
  //       "title": "Skin Types ",
  //       "parent_id": 42,
  //       "image_url": "",
  //       "position": 3,
  //       "path": "1/41/42/112",
  //       "item_id": 112,
  //       "url_key": "skin-types",
  //       "children": {
  //         "433": {
  //           "__typename": "MenuItem",
  //           "title": "Dry Skin ",
  //           "parent_id": 112,
  //           "image_url": "",
  //           "position": 1,
  //           "path": "1/41/42/112/433",
  //           "item_id": 433,
  //           "url_key": "dry-skin",
  //           "children": {}
  //         },
  //         "434": {
  //           "__typename": "MenuItem",
  //           "title": "Oily Skin",
  //           "parent_id": 112,
  //           "image_url": "",
  //           "position": 2,
  //           "path": "1/41/42/112/434",
  //           "item_id": 434,
  //           "url_key": "oily-skin",
  //           "children": {}
  //         },
  //         "435": {
  //           "__typename": "MenuItem",
  //           "title": "Combination Skin",
  //           "parent_id": 112,
  //           "image_url": "",
  //           "position": 3,
  //           "path": "1/41/42/112/435",
  //           "item_id": 435,
  //           "url_key": "combination-skin",
  //           "children": {}
  //         },
  //         "436": {
  //           "__typename": "MenuItem",
  //           "title": "Normal Skin",
  //           "parent_id": 112,
  //           "image_url": "",
  //           "position": 4,
  //           "path": "1/41/42/112/436",
  //           "item_id": 436,
  //           "url_key": "normal-skin",
  //           "children": {}
  //         }
  //       }
  //     },
  //     "195": {
  //       "__typename": "MenuItem",
  //       "title": "DiamondClean",
  //       "parent_id": 42,
  //       "image_url": "",
  //       "position": 10,
  //       "path": "1/41/42/195",
  //       "item_id": 195,
  //       "url_key": "diamondclean",
  //       "children": {}
  //     },
  //     "293": {
  //       "__typename": "MenuItem",
  //       "title": "Electric Beauty",
  //       "parent_id": 42,
  //       "image_url": "",
  //       "position": 9,
  //       "path": "1/41/42/293",
  //       "item_id": 293,
  //       "url_key": "electric-beauty",
  //       "children": {}
  //     },
  //     "295": {
  //       "__typename": "MenuItem",
  //       "title": "Testers & Minis",
  //       "parent_id": 42,
  //       "image_url": "",
  //       "position": 11,
  //       "path": "1/41/42/295",
  //       "item_id": 295,
  //       "url_key": "beauty-testers",
  //       "children": {}
  //     },
  //     "296": {
  //       "__typename": "MenuItem",
  //       "title": "Wellness",
  //       "parent_id": 42,
  //       "image_url": "",
  //       "position": 12,
  //       "path": "1/41/42/296",
  //       "item_id": 296,
  //       "url_key": "wellness",
  //       "children": {
  //         "501": {
  //           "__typename": "MenuItem",
  //           "title": "Supplements",
  //           "parent_id": 296,
  //           "image_url": "",
  //           "position": 1,
  //           "path": "1/41/42/296/501",
  //           "item_id": 501,
  //           "url_key": "supplements",
  //           "children": {}
  //         },
  //         "502": {
  //           "__typename": "MenuItem",
  //           "title": "Sexual Wellness",
  //           "parent_id": 296,
  //           "image_url": "",
  //           "position": 2,
  //           "path": "1/41/42/296/502",
  //           "item_id": 502,
  //           "url_key": "sexual-wellness",
  //           "children": {}
  //         },
  //         "503": {
  //           "__typename": "MenuItem",
  //           "title": "Intimate Care",
  //           "parent_id": 296,
  //           "image_url": "",
  //           "position": 3,
  //           "path": "1/41/42/296/503",
  //           "item_id": 503,
  //           "url_key": "intimate-care",
  //           "children": {}
  //         }
  //       }
  //     },
  //     "298": {
  //       "__typename": "MenuItem",
  //       "title": "Asia Beauty",
  //       "parent_id": 42,
  //       "image_url": "",
  //       "position": 13,
  //       "path": "1/41/42/298",
  //       "item_id": 298,
  //       "url_key": "asia-beauty",
  //       "children": {}
  //     }
  //   }
  // }
  const [activeSubmenu, setActiveSubMenu] = useState<Category | null>();
  const handlePopoverOpen = (children: Category | null) => {
    setActiveSubMenu(children);
  };


  const handlePopoverClose = () => {
    if (open) {
      // setActiveSubMenu(null);
    }
  };

  const open = Boolean(activeSubmenu);

  const categories: Category[] = isValidObject(menuItems)
    ? Object.values(Object.values(menuItems)?.[0]?.children)
    : [];
  const isActive = (id: string | number) => Boolean(activeMenus?.includes(`${id}`));
  console.log('activeSubmenu', activeSubmenu);

  const submenuSections = isValidObject(activeSubmenu?.children)
    ? (Object.values(activeSubmenu?.children || {}) as unknown as Category[])
    : [];
  const sectionsSorted = submenuSections
    .filter((s) => typeof s === 'object' && s)
    .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0));

  const sectionsWithChildren = sectionsSorted.filter((s) =>
    isValidObject(s?.children) && Object.keys(s?.children || {}).length > 0
  );
  const leafSections = sectionsSorted.filter(
    (s) => !isValidObject(s?.children) || Object.keys(s?.children || {}).length === 0
  );

  // 动态列：有子分类的 section 各占一列，无子分类的 leaf 合并为最后一列
  type GridColumnItem =
    | { type: 'section'; section: Category }
    | { type: 'leafs'; leafs: Category[] };
  const gridColumns: GridColumnItem[] = [
    ...sectionsWithChildren.map((s) => ({ type: 'section' as const, section: s })),
    ...(isValidArray(leafSections) ? [{ type: 'leafs' as const, leafs: leafSections }] : []),
  ];

  return (
    <ErrorBoundary>
      <div ref={anchorEl} aria-label="menu" className="hidden lg:flex ">
        <div
          aria-label="menu-panel"
          className="flex  items-center justify-between h-full gap-x-3 xl:gap-x-8 group"
        >
          <button className="flex w-36 items-center gap-1 border-0 font-Lexend rounded-3xl px-4 py-2 bg-black text-white  font-semibold">
            <MenuIcon />
            <span className="whitespace-nowrap">All Categories</span>
          </button>
          <div className="w-0.5 h-5 bg-[#E2E8F0]"></div>
          <div className="flex gap-x-4 items-center text-[#45556C] font-medium ">
            <span
              className="whitespace-nowrap hover:text-black line-clamp-1"
              onMouseEnter={handlePopoverClose}
            >
              <Link href={`/catalog/category/`}>
                Top Deals
              </Link>
            </span>
            <span
              className="whitespace-nowrap hover:text-black  line-clamp-1"
              onMouseEnter={handlePopoverClose}
            >
              <Link href={`/catalog/category/`}>
                Bestsellers
              </Link>
            </span>
          </div>

          {isValidArray(categories) &&
            categories.map(
              (category, index) =>
                index < 8 && (
                  <div
                    aria-label={category?.title}
                    key={category?.title}
                    className={
                      'flex items-center cta  font-medium text-[#45556C] text-[1rem]  hover:text-gray-800'
                    }
                  >
                    {isValidObject(category?.children) ? (
                      <span
                        className="relative "
                        aria-owns={open ? 'mouse-over-popover' : undefined}
                        aria-haspopup="true"
                      >
                        <ul
                          className={`flex items-center px-1 mx-0 gap-x-1  ${isActive(category.item_id) && 'text-brand'}`}
                        >
                          <li
                            className="flex items-center list-none"
                            onMouseEnter={() =>
                              handlePopoverOpen(category || null)
                            }
                          >
                            <Link
                              className="whitespace-nowrap"
                              href={`/catalog/category/${category?.url_key}`}
                            >
                              {category?.title}
                            </Link>
                          </li>
                        </ul>
                      </span>
                    ) : (
                      <span
                        onMouseLeave={handlePopoverClose}
                        className="hover:text-black"
                      >
                        <Link href={`/catalog/category/${category?.url_key}`}>
                          {category?.title}
                        </Link>
                      </span>
                    )}
                  </div>
                )
            )}
        </div>
        <ErrorBoundary>
          {isValidObject(activeSubmenu) && (
            <Box onMouseLeave={handlePopoverClose}>
              <ClickAwayListener onClickAway={handlePopoverClose}>
                <Popper
                  className="w-full mt-[138px] z-[99999]  bg-white shadow-2xl shadow-neutral-500/70"
                  open={open}
                  anchorEl={anchorEl.current}
                  transition
                  id="megamenu-popover"
                >
                  <div className="inset-0 shadow" aria-hidden="true" />
                  <Containers>
                    <div className="relative px-[6.625rem] max-h-[420px] py-5 dropdown_menu">
                      <div className="mx-auto">
                        <div
                          className="grid py-2 gap-x-14 gap-y-10"
                          style={{
                            gridTemplateColumns: `repeat(${gridColumns.length}, minmax(0, 1fr))`,
                          }}
                        >
                          {gridColumns.map((col, idx) =>
                            col.type === 'leafs' ? (
                              <div key={`leafs-${idx}`} className="min-w-0 flex flex-col gap-y-4">
                                {col.leafs.map((leaf) => (
                                  <Link
                                    key={leaf?.item_id}
                                    href={`/catalog/category/${leaf?.url_key}`}
                                    className={`block font-bold uppercase tracking-wide text-[0.95rem] text-gray-900 hover-underline-animation ${isActive(leaf.item_id) ? 'text-brand' : ''}`}
                                  >
                                    {leaf?.title}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div key={col.section.item_id} className="min-w-0">
                                <Link
                                  href={`/catalog/category/${col.section?.url_key}`}
                                  id={`${col.section?.title}-heading`}
                                  className={`block font-bold uppercase tracking-wide text-[0.95rem] text-gray-900 hover-underline-animation ${isActive(col.section.item_id) ? 'text-brand' : ''}`}
                                >
                                  {col.section?.title}
                                </Link>
                                {isValidObject(col.section?.children) && (
                                  <ul
                                    role="list"
                                    aria-labelledby={`${col.section.title}-heading`}
                                    className="flex flex-col px-2 list-none mt-2 gap-y-1"
                                  >
                                    {(Object.values(col.section?.children || {}) as FormattedMenuItem[]).map((item) => (
                                      <li key={item?.title} className="cta">
                                        <Link
                                          href={`/catalog/category/${item.url_key}`}
                                          className={`hover:text-gray-800 text-[0.9rem] font-normal hover-underline-animation ${isActive(item.item_id) ? 'text-brand' : ''}`}
                                        >
                                          {item?.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </Containers>
                </Popper>
              </ClickAwayListener>
            </Box>
          )}
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}
