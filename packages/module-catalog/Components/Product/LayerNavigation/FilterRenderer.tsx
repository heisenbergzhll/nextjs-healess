import ListItem from '@mui/material/ListItem';
import { isSelectedFilter } from '@utils/Helper';
import { AnimatePresence, motion } from 'framer-motion';

import { useLazyQuery } from '@apollo/client';
import CheckBoxOutlineBlankRounded from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import CheckedIcon from '@packages/module-theme/components/elements/CheckedIcon';
import {
  getCategoryFilterQuery,
  getFormattedPriceFilterLabel,
  getUniqueArray,
  isValidArray,
} from '@utils/Helper';
import PRODUCT_AGGRESSION from '@voguish/module-catalog/graphql/ProductAggregation.query.graphql';
import {
  AggregationInterface,
  AppliedLayerFilter,
  FilterEqualTypeInput,
  FilterRangeTypeInput,
  ProductAttributeFilterInput,
} from '@voguish/module-catalog/types';
import InfiniteScrollDiv from '@voguish/module-common/InfiniteScroll';
import { CategorySearchPlaceHolder } from '@voguish/module-marketplace/Components/Placeholder';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChangeEvent, useState } from 'react';

let debounceTimer: ReturnType<typeof setTimeout>;

const FilterRenderer = ({
  filter,
  expandedView = false,
  manageFilterAction,
  appliedFilters = [],
  selectedCategory,
}: {
  selectedCategory?: string;
  appliedFilters: AppliedLayerFilter[] | undefined;
  filter: AggregationInterface;
  expandedView?: boolean;
  manageFilterAction: (
    payload: // eslint-disable-line
    ProductAttributeFilterInput
  ) => void;
}) => {
  const { t } = useTranslation('common');

  /**
   * To manage toggle of Filter renderer
   */
  const [open, setOpen] = useState(expandedView);

  const router = useRouter();
  const {
    query: { urlKey: queries = [] },
  } = router;
  const [filterOption, setFilterOption] = useState<any>([]);

  const [inputSearch, setSearchValue] = useState<string>('');
  const attributePageSize = 5;
  const [searchCategory, { loading: searchLoading }] =
    useLazyQuery(PRODUCT_AGGRESSION);
  const handleFilter = (
    event: ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    const filterName = event.target.name;
    let filterValue: FilterRangeTypeInput | FilterEqualTypeInput = {
      eq: value,
    };
    // For price filters, parse the range format
    if (filterName === 'price' && value.includes('_')) {
      const [from, to] = value.split('_');
      filterValue = { from, to };
    } else if (filterName === 'category_uid') {
      filterValue = { eq: value };
    }
    manageFilterAction({ [event.target.name]: filterValue });
  };
  /**
   * Handling Toggle of filter
   */
  const handleClick = () => {
    setOpen(!open);
  };

  const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      if (!filter?.attribute_code) {
        return;
      }
      searchCategory({
        variables: {
          filters: {
            attribute_filter: [
              {
                currentPage: 1,
                code: filter.attribute_code,
                search: value,
                pageSize: attributePageSize ?? 5,
              },
            ],
          },
        },
      }).then((response) => {
        const data = response?.data?.productAggrigations?.at(0)?.options;
        setFilterOption(data);
      });
    }, 500);
  };
  return (
    <ErrorBoundary>
      <div className="w-full max-w-xl mx-auto ">
        <div className="bg-white rounded-lg">
          <button
            onClick={handleClick}
            className="w-full py-2.5 pl-4 border-none cursor-pointer bg-transparent p-2 flex justify-between items-center text-left font-semibold text-gray-800 hover:bg-gray-50 transition"
          >
            <span className="text-base capitalize">{filter?.label}</span>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-5 h-5"
            >
              <KeyboardArrowDownIcon />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.1, ease: 'easeInOut' }}
                className="px-4 pt-2 pb-4 overflow-hidden border-t"
              >
                <input
                  type="text"
                  placeholder={t('Type to search...')}
                  value={inputSearch}
                  onChange={searchHandler}
                  className="w-full px-3 py-2 mb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ul className="px-0 py-0 mx-0 my-0 overflow-y-auto ">
                  <RadioGroup
                    name={filter.attribute_code}
                    onChange={handleFilter}
                  >
                    {!inputSearch ? (
                      <ErrorBoundary>
                        <InfiniteScrollDiv
                          TOTAL_DATA={getUniqueArray([...filter?.options])}
                        >
                          {(option, index) => (
                            <ListItem
                              key={index}
                              className="rtl:-mr-7"
                              disablePadding
                            >
                              <Link
                                className="w-full no-underline"
                                href={
                                  selectedCategory === option.value
                                    ? router?.asPath
                                    : getCategoryFilterQuery(
                                        router,
                                        filter.attribute_code,
                                        option.value,
                                        isSelectedFilter(
                                          filter.attribute_code,
                                          option.value,
                                          router?.asPath
                                        )
                                      )
                                }
                              >
                                <span className="flex items-center w-full py-1 pb-0">
                                  <Radio
                                    className="hover:bg-transparent"
                                    checkedIcon={<CheckedIcon />}
                                    checked={
                                      isSelectedFilter(
                                        filter.attribute_code,
                                        option.value,
                                        router?.asPath
                                      ) || selectedCategory === option.value
                                    }
                                    icon={<CheckBoxOutlineBlankRounded />}
                                    value={option.value}
                                  />{' '}
                                  <label
                                    className="w-full pt-[0.275rem] leading-normal lg:leading-[2.15rem]"
                                    id={`${filter.attribute_code}_${option.value}`}
                                  >
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          filter.attribute_code === 'price'
                                            ? getFormattedPriceFilterLabel(
                                                option.label,
                                                option.value
                                              )
                                            : option.label,
                                      }}
                                    />
                                  </label>
                                </span>
                              </Link>
                            </ListItem>
                          )}
                        </InfiniteScrollDiv>
                      </ErrorBoundary>
                    ) : inputSearch && isValidArray(filterOption) ? (
                      <ErrorBoundary>
                        <div className="p-0 overflow-y-auto border border-gray-300 rounded-md shadow-sm max-h-60">
                          {filterOption?.map(
                            (
                              option: {
                                label: string;
                                value: string;
                              },
                              index: number
                            ) => (
                              <ListItem
                                key={index}
                                className="rtl:-mr-7"
                                disablePadding
                              >
                                <Link
                                  className="w-full no-underline"
                                  href={
                                    selectedCategory === option.value
                                      ? router?.asPath
                                      : getCategoryFilterQuery(
                                          router,
                                          filter.attribute_code,
                                          option.value,
                                          isSelectedFilter(
                                            filter.attribute_code,
                                            option.value,
                                            router?.asPath
                                          )
                                        )
                                  }
                                >
                                  <span className="flex items-center w-full py-1 pb-0">
                                    <Radio
                                      className="hover:bg-transparent"
                                      checkedIcon={<CheckedIcon />}
                                      checked={isSelectedFilter(
                                        filter.attribute_code,
                                        option.value,
                                        router?.asPath
                                      )}
                                      icon={<CheckBoxOutlineBlankRounded />}
                                      value={option.value}
                                    />
                                    <label
                                      className="w-full pt-[0.275rem] leading-normal lg:leading-[2.15rem]"
                                      id={`${filter.attribute_code}_${option.value}`}
                                    >
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html:
                                            filter.attribute_code === 'price'
                                              ? getFormattedPriceFilterLabel(
                                                  option.label,
                                                  option.value
                                                )
                                              : option.label,
                                        }}
                                      />
                                    </label>
                                  </span>
                                </Link>
                              </ListItem>
                            )
                          )}
                        </div>
                      </ErrorBoundary>
                    ) : !searchLoading && inputSearch?.length >= 3 ? (
                      <div className="py-3 text-center text-gray-600 border border-gray-300 border-solid rounded-md">
                        {t('Not Found')}
                      </div>
                    ) : (
                      <CategorySearchPlaceHolder />
                    )}
                  </RadioGroup>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FilterRenderer;
