import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Popper from '@mui/material/Popper';
import { isValidArray, isValidObject } from '@utils/Helper';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Containers from '@voguish/module-theme/components/ui/Container';
import Image from 'next/image';
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
  item_id: string;
  children?: MenuItem;
};

export default function MegaMenu({ menuItems, activeMenus }: MegaMenuProps) {
  const anchorEl = useRef(null);

  const [activeSubmenu, setActiveSubMenu] = useState<Category | null>(null);

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

  const isActive = (id: string) => {
    return Boolean(activeMenus?.includes(`${id}`));
  };
  return (
    <ErrorBoundary>
      <div ref={anchorEl} aria-label="menu" className="hidden lg:flex ">
        <div
          aria-label="menu-panel"
          className="flex flex-row-reverse items-center justify-between h-full gap-x-5 xl:gap-x-8 group"
        >
          {isValidArray(categories) &&
            categories.map(
              (category, index) =>
                index < 8 && (
                  <div
                    aria-label={category?.title}
                    key={category?.title}
                    className={
                      'flex items-center cta px-1 font-semibold text-gray-700 text-[1rem] last:rtl:pr-9 last:ltr:pl-9 hover:text-gray-800'
                    }
                  >
                    {isValidObject(category?.children) ? (
                      <span
                        className="relative "
                        aria-owns={open ? 'mouse-over-popover' : undefined}
                        aria-haspopup="true"
                      >
                        <ul
                          className={`flex items-center px-1 mx-0 gap-x-1 hover-underline-animation ${
                            isActive(category.item_id) && 'text-brand'
                          }`}
                        >
                          <li
                            className="flex items-center list-none"
                            onMouseEnter={() =>
                              handlePopoverOpen(category || null)
                            }
                          >
                            <Link
                              href={`/catalog/category/${category?.url_key}`}
                            >
                              {category?.title}
                            </Link>
                            <KeyboardArrowDownIcon
                              className={`${
                                activeSubmenu !== category
                                  ? 'fa-arrow-down-close'
                                  : 'fa-arrow-down'
                              }`}
                            />
                          </li>
                        </ul>
                      </span>
                    ) : (
                      <span
                        onMouseLeave={handlePopoverClose}
                        className="px-1 hover-underline-animation line-clamp-1"
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
          {' '}
          {isValidObject(activeSubmenu) && (
            <Box onMouseLeave={handlePopoverClose}>
              <ClickAwayListener onClickAway={handlePopoverClose}>
                <Popper
                  className="w-full mt-14 z-[99999]  bg-white shadow-2xl shadow-neutral-500/70"
                  open={open}
                  anchorEl={anchorEl.current}
                  transition
                  id="megamenu-popover"
                >
                  <div className="inset-0 shadow" aria-hidden="true" />
                  <Containers>
                    <div className="relative py-5 dropdown_menu">
                      <div className="mx-auto">
                        <div className="grid grid-cols-2 py-8 group gap-y-10">
                          <div className="grid grid-cols-2">
                            {isValidObject(activeSubmenu?.children) &&
                              Object.values(activeSubmenu?.children || {})?.map(
                                (section) =>
                                  typeof section === 'object' && (
                                    <div
                                      key={section?.title}
                                      className="relative"
                                    >
                                      <span className="cta group-first:rtl:mr-2.5 group-first:ltr:ml-2.5">
                                        <Link
                                          href={`/catalog/category/${section?.url_key}`}
                                          id={`${section?.title}-heading`}
                                          className={`font-bold text-[1rem] hover-underline-animation ${
                                            isActive(section.item_id)
                                              ? 'text-brand'
                                              : ' text-gray-900 '
                                          }`}
                                        >
                                          {section?.title}
                                        </Link>
                                      </span>
                                      <ul
                                        role="list"
                                        aria-labelledby={`${section.title}-heading`}
                                        className="flex flex-col mt-6 gap-y-6 sm:mt-4 sm:gap-y-4"
                                      >
                                        {isValidObject(section?.children) &&
                                          Object.values(section?.children).map(
                                            (item) => (
                                              <li
                                                key={item?.title}
                                                className="flex mt-2 rtl:-mr-[1.9rem] ltr:-ml-[1.9rem] cta"
                                              >
                                                <Link
                                                  href={`/catalog/category/${item.url_key}`}
                                                  className={`hover:text-gray-800 text-[0.9rem] font-medium hover-underline-animation ${
                                                    isActive(item.item_id) &&
                                                    'text-brand'
                                                  }`}
                                                >
                                                  {item?.title}
                                                </Link>
                                              </li>
                                            )
                                          )}
                                      </ul>
                                    </div>
                                  )
                              )}
                          </div>
                          <div className="grid grid-cols-2">
                            {activeSubmenu && activeSubmenu.image_url && (
                              <div className="grid">
                                <Link
                                  href={`/catalog/category/${activeSubmenu?.url_key}`}
                                >
                                  <Image
                                    className="object-cover object-top border border-solid rounded-md border-commonBorder"
                                    alt={activeSubmenu?.title}
                                    height={200}
                                    decoding="auto"
                                    width={200}
                                    src={activeSubmenu.image_url}
                                  />
                                </Link>
                                <span className="mt-1 rtl:-mr-0.5 ltr:-ml-0.5 cta">
                                  <Link
                                    href={`/catalog/category/${activeSubmenu?.url_key}`}
                                    id={`${activeSubmenu?.title}-heading`}
                                    className={`font-bold text-gray-900 text-[1rem] hover-underline-animation ${
                                      isActive(activeSubmenu.item_id) &&
                                      'text-brand'
                                    }`}
                                  >
                                    {activeSubmenu?.title}
                                  </Link>
                                </span>
                              </div>
                            )}
                            {isValidObject(activeSubmenu?.children) &&
                              Object.values(activeSubmenu?.children || {}).map(
                                (section) =>
                                  section.image_url !== '' && (
                                    <div className="grid" key={section?.title}>
                                      <Link
                                        href={`/catalog/category/${section?.url_key}`}
                                      >
                                        <Image
                                          className="object-cover object-top border border-solid rounded-md border-commonBorder"
                                          alt={section?.title}
                                          height={200}
                                          decoding="auto"
                                          width={200}
                                          src={section.image_url || ''}
                                        />
                                      </Link>
                                      <span className="mt-1 rtl:-mr-0.5 ltr:-ml-0.5 cta">
                                        <Link
                                          href={`/catalog/category/${section?.url_key}`}
                                          id={`${section?.title}-heading`}
                                          className={`font-bold text-gray-900 text-[1rem] hover-underline-animation ${
                                            isActive(section.item_id) &&
                                            'text-brand'
                                          }`}
                                        >
                                          {section?.title}
                                        </Link>
                                      </span>
                                    </div>
                                  )
                              )}
                          </div>
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
