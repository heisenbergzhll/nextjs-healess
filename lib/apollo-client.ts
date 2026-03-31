import {
  ApolloCache,
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useMemo } from 'react';
export type ClientContext = {
  cache: ApolloCache<NormalizedCacheObject>;
  headers?: Record<string, string>;
};
const uri = `${process.env.MAGENTO_ENDPOINT}graphql`;
export const httpLink = createHttpLink({
  uri: uri,
});

const storeLink = setContext((_, { headers }) => {
  // get the store from local storage if it exists
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
    },
  };
});
/**
 * Polyfill Global Variables in Server
 */
if (typeof window === 'undefined') {
  global.URL = require('url').URL;
}

let apolloClient: ApolloClient<any> | null = null;

// Handling  GraphQl and Network error globally
const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors?.forEach(({ message }) => {
      // prettier-ignore
      if (message === 'The current customer isn\'t authorized.') {
        // redirect('/customer/account/logout', RedirectType.push);
      }
    });
  }
});

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    // credentials: 'include',
    // add form array for using errorLink and  HttpLink both together.
    // link: from([errorLink, storeLink.concat(httpLink)]),

    link: from([errorLink, storeLink.concat(httpLink)]),

    cache: new InMemoryCache({
      typePolicies: {},
    }),
  });
}
export const setAuthToken = (token: string) =>
  setContext((_, { headers }) => ({
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  }));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setStoreCode = (store_code: string) =>
  setContext((_, { headers }) => ({
    headers: {
      ...headers,
      store: store_code,
    },
  }));
export function initializeApollo(initialState: ApolloCache<any> | null = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState: ApolloCache<any>) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}

/**
 * * For SSR use..
 */
export const client = initializeApollo();
