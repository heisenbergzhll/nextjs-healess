'use client';
import { useLazyQuery } from '@apollo/client';
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from '@headlessui/react';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import Search_POP_Query from '@voguish/module-theme/graphql/search.graphql';
import { Fragment, useEffect, useState } from 'react';
export interface SearchPopResult {
  xsearchPopularSearches: {
    code: string,
    items: [Item];
    total_count: number
  }
}
export type Item = {
  name: string;
  num_results: string;
  url: string;
};

const SEARCH_BUTTON_BORDER = '#BB742F';

export default function Search() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>("value");

  const [getPopularSearch, { data, loading }] =
    useLazyQuery<SearchPopResult>(Search_POP_Query);
  const searchItems = data?.xsearchPopularSearches?.items ?? [];

  const [getSuggestionSearch, { data: suggestData }] =
    useLazyQuery<SearchPopResult>(Search_POP_Query);
  const suggestItems = suggestData?.xsearchPopularSearches?.items ?? [];

  const filterItems = query ? searchItems : suggestItems;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      getPopularSearch({
        variables: { search: query }
      });
    }
  };
  const handleSearch = () => {
    if (query.trim()?.length >= 3) {
      getPopularSearch({
        variables: { search: query }
      });
    }
  }
  const handleKeyDown = () => {
    handleSearch();
  }
  useEffect(() => {
    if (query.length < 3) return;
    handleSearch();
  }, [query]);

  useEffect(() => {
    getSuggestionSearch({
      variables: { search: "" }
    });
  }, [])
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[37rem]">
      <Combobox
        value={selected}
        onChange={(value) => {
          setSelected(value);
          setQuery(value ?? '');
        }}
        onClose={() => setSelected(null)}
        immediate
      >
        <div className="relative w-full">
          <div className="flex w-full items-center overflow-hidden rounded-full border border-[#F1F5F9] bg-[#F1F5F9] focus-within:ring-1 focus-within:ring-[#BB742F] hover:border-[#BB742F] hover:bg-brand20">
            <div
              className="flex shrink-0 items-center justify-center rounded-full border-2 p-2 ltr:ml-2 rtl:mr-2"
              style={{ borderColor: SEARCH_BUTTON_BORDER }}
              aria-hidden
            >
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <ComboboxInput
              className="min-w-0 flex-1 border-0 bg-transparent font-Lexend font-medium py-4 pl-2 pr-2 text-gray-900 placeholder-gray-500 focus:ring-0 focus-visible:outline-none"
              placeholder="Search for 'Arabic Fragrances'..."
              aria-label="Search"
              displayValue={() => query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleKeyDown()
                }
              }}
            />
            {/* bg-black/20 */}
            <button
              type="submit"
              className={`flex shrink-0 items-center border-0  justify-center rounded-full p-2 ltr:mr-2 rtl:ml-2 transition-opacity hover:opacity-90 
                ${query.length >= 3
                  ? 'bg-brand'
                  : 'bg-black/20'
                }`}
              aria-label="Search"
            >

              <ArrowForwardIosOutlinedIcon className="h-4 w-4 text-white" />
              {/* <svg
               
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg> */}
            </button>
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <ComboboxOptions
              static
              className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 empty:invisible"
            >
              <div className="relative bg-white">
                {filterItems.length === 0 && query !== '' ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-500">
                    No results.
                  </div>
                ) : (
                  filterItems.map((item: Item, key: number) => (
                    <ComboboxOption
                      key={key}
                      value={item}
                      className="relative cursor-pointer select-none px-4 py-2 font-light text-blue-600 data-[focus]:bg-gray-100 data-[focus]:outline-none capitalize"
                    >
                      {
                        query ? <div
                          dangerouslySetInnerHTML={{ __html: item.name }}
                        /> : <Fragment>{item.name}</Fragment>
                      }
                    </ComboboxOption>
                  ))
                )}
              </div>
            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>
    </form>
  );
}
