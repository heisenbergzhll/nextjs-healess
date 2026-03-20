import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Popper from '@mui/material/Popper';
import { isValidArray, isValidObject } from '@utils/Helper';
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
  const [activeSubmenu, setActiveSubMenu] = useState<Category | null>();
  const handlePopoverOpen = (children: Category | null) => {
    setActiveSubMenu(children);
  };


  const handlePopoverClose = () => {
    if (open) {
      setActiveSubMenu(null);
    }
  };

  const open = Boolean(activeSubmenu);

  const categories: Category[] = isValidObject(menuItems)
    ? Object.values(Object.values(menuItems)?.[0]?.children)
    : [];
  const isActive = (id: string | number) => Boolean(activeMenus?.includes(`${id}`));

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
          {/* <button className="flex w-36 items-center gap-1 border-0 font-Lexend rounded-3xl px-4 py-2 bg-black text-white  font-semibold">
            <MenuIcon />
            <span className="whitespace-nowrap">All Categories</span>
          </button>
          <div className="w-0.5 h-5 bg-[#E2E8F0]"></div> */}
          <div className="flex gap-x-4 items-center text-[#45556C] font-medium">
            <span
              className="whitespace-nowrap hover:text-black line-clamp-1 py-4"
              onMouseEnter={handlePopoverClose}
            >
              <Link href={`/catalog/category/`}>
                Top Deals
              </Link>
            </span>
            <span
              className="whitespace-nowrap hover:text-black  line-clamp-1 py-4"
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
                  className="w-full mt-[138px] z-[50]  bg-white shadow-2xl shadow-neutral-500/70"
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
                                  className={`block font-medium uppercase tracking-wide text-[0.95rem] text-gray-900 hover-underline-animation ${isActive(col.section.item_id) ? 'text-brand' : ''}`}
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
