import FadeInView from '@packages/module-theme/components/ui/FadeInView';
import { SEARCH_FIELD } from '@utils/Constants';
import {
  createQueryForLink,
  getCategoryFilterQuery,
  isValidArray,
  isValidObject,
  parseAppliedFilter,
} from '@utils/Helper';
import {
  PaginationActionType,
  ProductAttributeFilterInput,
  ProductListViewType,
  ProductListingView,
  ProductsAction,
  ProductsInterface,
  ProductsQueryInput,
  ToolbarActionType,
} from '@voguish/module-catalog/types';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Reducer, useReducer, useState } from 'react';
import {
  FilterSidebarSkeleton,
  LayeredPlaceHolder,
  MobilePlaceHolder,
} from './Detail/placeholder/PlaceHolder';
import Placeholder from './Item/Placeholder';
const DesktopFilter = dynamic(() => import('./Item/DesktopFilter'), {
  loading: () => {
    return <MobilePlaceHolder />;
  },
});
const FiltersRenderer = dynamic(
  () =>
    import('@voguish/module-catalog/Components/Product/LayerNavigation/FiltersRenderer'),
  {
    loading: () => {
      return <LayeredPlaceHolder />;
    },
  }
);

const Pagination = dynamic(
  () => import('@voguish/module-theme/components/widgets/Pagination')
);

const MobileFilter = dynamic(() => import('./Item/MobileFilter'));
const ProductItem = dynamic(() => import('./Item/Item'), {
  loading: () => {
    return <Placeholder />;
  },
});
const EmptyPage = dynamic(
  () => import('@voguish/module-theme/components/ui/EmptyPage')
);

/**
 * Initial Search Criteria
 */
const initialSearchCriteria: ProductsQueryInput = {
  pageSize: 54,
};
/**
 *
 * @param state ProductsQueryInput
 * @param action ProductsAction
 * @returns
 */
const searchCriteriaReducer: Reducer<ProductsQueryInput, ProductsAction> = (
  state,
  action
) => {
  const value = action.payload;

  if (action.type === ToolbarActionType.SORT) {
    let sortValue = `${value}`.split('||');
    state.sort = { [sortValue[0]]: sortValue[1] };
  }

  if (action.type === PaginationActionType.PAGE) {
    state.currentPage = parseInt(`${value}`);
  }

  if (action.type === PaginationActionType.LIMIT) {
    state.pageSize = parseInt(`${value}`);
  }

  if (action.type === 'search' && typeof value === 'string') {
    state.search = value;
  }
  if (
    action.type === 'filter' &&
    typeof value !== 'string' &&
    typeof value !== 'number'
  ) {
    state.filters = { ...state.filters, ...value };
  }

  if (action.type === 'removeFilter' && value && typeof value === 'string') {
    let filters = state.filters;
    if (filters && isValidObject(filters)) {
      delete filters[value];
      state.filters = filters;
    }
  }
  return state;
};

const ProductList = ({
  showPagination,
  loading = false,
  title,
  selectedCategory,
  showLayeredNavigation,
  category,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  search = '',
  products,
  showToolBar,
  aggregations,
  aggreLoad,
  sort,
}: ProductsInterface) => {
  const [searchCriteria, dispatchSearchCriteria] = useReducer(
    searchCriteriaReducer,
    initialSearchCriteria
  );
  /**
   * Managing View
   */
  const [view, setView] = useState<ProductListingView>(
    ProductListViewType.GRID
  );

  let { pageSize, currentPage } = searchCriteria;

  const router = useRouter();
  const {
    query: { urlKey: queries = [] },
  } = router;

  const limitIndex = queries.indexOf('limit');
  const pageIndex = queries.indexOf('page');

  if (pageIndex !== -1) {
    currentPage = Number(queries[pageIndex + 1]);
  }

  if (limitIndex !== -1) {
    pageSize = Number(queries[limitIndex + 1]);
  }

  // Product Props
  const sortFields = sort;
  const { items = [], total_count: totalCount = 0 } = products;
  let filters = products?.applied_filters;
  const appliedFilters = router?.asPath?.includes(SEARCH_FIELD)
    ? filters
    : parseAppliedFilter(filters);
  // Placeholders for Product List
  const placeHolders = new Array(pageSize || 12).fill(0);

  const activeSortKey: string | null = sort ? Object.keys(sort)[0] : null;

  let activeSort =
    activeSortKey && sort
      ? `${activeSortKey}_${Object.values(sort)[0]}`
      : 'position_asc';

  const removePagination = false;
  /**
   * To manage Pagination
   */
  const managePagination = ({
    action,
    payload,
  }: {
    action: PaginationActionType;
    payload: number;
  }) => {
    const queryParameters: string | string[] = createQueryForLink(
      queries,
      action,
      String(payload),
      removePagination
    );
    if (isValidArray(queryParameters)) {
      router.push(getCategoryFilterQuery(router, action, String(payload)));
    }
  };

  /**
   * To Manage Toolbar
   */

  const manageToolbar = ({
    action,
    payload,
  }: {
    action: ToolbarActionType;
    payload: ProductListingView | string;
  }) => {
    if (action === ToolbarActionType.VIEW) {
      setView(
        (payload === ProductListViewType.GRID && ProductListViewType.GRID) ||
          (payload === ProductListViewType.LIST && ProductListViewType.LIST) ||
          (payload === ProductListViewType.TWOGRID &&
            ProductListViewType.TWOGRID) ||
          ProductListViewType.GRID
      );
    } else {
      dispatchSearchCriteria({
        type: action,
        payload: payload,
      });
    }
  };
  /**
   * To Manage Layered Navigation Filter
   */
  const manageFilterAction = (payload: ProductAttributeFilterInput) => {
    dispatchSearchCriteria({ type: 'filter', payload: payload });
  };
  return (
    <ErrorBoundary>
      <div className="!z-2 flex flex-col gap-6">
        <span className="lg:hidden">
          <ErrorBoundary>
            <MobileFilter
              title={`${title}(${totalCount})`}
              activeSort={activeSort}
              manageToolbar={manageToolbar}
              loading={aggreLoad}
              appliedFilters={appliedFilters}
              manageFilterAction={manageFilterAction}
              sortFields={sortFields}
              aggregations={aggregations}
            />
          </ErrorBoundary>
        </span>

        <ErrorBoundary>
          <DesktopFilter
            loading={aggreLoad}
            title={[title, totalCount]}
            activeSort={activeSort}
            view={view}
            manageToolbar={manageToolbar}
            sortFields={sortFields}
            showToolBar={showToolBar}
          />
        </ErrorBoundary>
        <div className="grid grid-cols-12 gap-4">
          {aggregations && Object.keys(aggregations).length > 0 && (
            <div className="col-span-3 rounded-md -lg:hidden">
              <ErrorBoundary>
                {aggreLoad ? (
                  <FilterSidebarSkeleton />
                ) : (
                  <FiltersRenderer
                    selectedCategory={selectedCategory}
                    appliedFilters={appliedFilters}
                    manageFilterAction={manageFilterAction}
                    filters={aggregations}
                  />
                )}
              </ErrorBoundary>
            </div>
          )}
          <div className="grid col-span-12 lg:col-span-9">
            {!isValidArray(items) ? (
              <ErrorBoundary>
                <EmptyPage />
              </ErrorBoundary>
            ) : (
              <>
                {view === ProductListViewType?.LIST && (
                  <div className="grid gap-4 md:gap-8 sm:grid-cols-2 md:grid-cols-1">
                    {loading
                      ? placeHolders.map((item, index) => (
                          <div key={`${index + item}`}>
                            <Placeholder />
                          </div>
                        ))
                      : items.map((product, index) => (
                          <FadeInView key={`${product?.uid}_${index}`}>
                            <ErrorBoundary>
                              <ProductItem
                                view={view}
                                product={product}
                                key={`${product?.uid}_${index}`}
                              />
                            </ErrorBoundary>
                          </FadeInView>
                        ))}
                  </div>
                )}
                {view === ProductListViewType?.TWOGRID && (
                  <div className="grid col-span-12 gap-4 md:gap-8 lg:col-span-9 sm:grid-cols-2">
                    {loading
                      ? placeHolders.map((item, index) => (
                          <div key={`${index + item}`}>
                            <Placeholder />
                          </div>
                        ))
                      : items.map((product, index) => (
                          <FadeInView key={`${product?.uid}_${index}`}>
                            <ErrorBoundary>
                              <ProductItem
                                view={view}
                                product={product}
                                key={`${product?.uid}_${index}`}
                              />
                            </ErrorBoundary>
                          </FadeInView>
                        ))}
                  </div>
                )}
                {view === ProductListViewType?.GRID && (
                  <div className="grid col-span-12 gap-4 md:gap-8 lg:col-span-9 md:grid-cols-3 sm:grid-cols-2">
                    {loading
                      ? placeHolders.map((item, index) => (
                          <div key={`${index + item}`}>
                            <Placeholder />
                          </div>
                        ))
                      : items.map((product, index) => (
                          <FadeInView key={`${product?.uid}_${index}`}>
                            <ErrorBoundary>
                              <ProductItem
                                view={view}
                                product={product}
                                key={`${product?.uid}_${index}`}
                              />
                            </ErrorBoundary>
                          </FadeInView>
                        ))}
                  </div>
                )}
              </>
            )}

            <Pagination
              pageSize={pageSize}
              loadingState={loading}
              totalCount={totalCount || 0}
              changeHandler={managePagination}
              currentPage={products?.page_info?.current_page || currentPage}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
export default ProductList;
