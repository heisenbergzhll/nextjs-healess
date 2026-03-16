import { ApolloError, DocumentNode } from '@apollo/client';
import { client } from '@lib/apollo-client';
import { Logout } from 'store';
import { errorCat } from './Constants';

export async function graphqlRequest({ query, variables, options = {} }: any) {
  try {
    const { data, errors, loading } = await client.query({
      query,
      variables,
      ...options,
    });
    console.log('errors', errors)
    if (errors && Array.isArray(errors)) {
      const isAuthError = errors.some(
        (err) =>
          errorCat.includes(err.extensions?.category) ||
          err.message.includes(
            'The current user cannot perform operations on cart'
          )
      );

      if (isAuthError) {
        Logout();
        throw new ApolloError({ graphQLErrors: errors });
      }

      throw new ApolloError({ graphQLErrors: errors });
    }

    if (!loading) {
      return data;
    }

    return loading;
  } catch (error: any) {
    console.warn(` feth-   ${error?.message || JSON.stringify(error)}`);

    if (
      error?.graphQLErrors?.some(
        (err: any) =>
          errorCat.includes(err.extensions?.category) ||
          err.message.includes(
            'The current user cannot perform operations on cart'
          )
      )
    ) {
      Logout();
    }

    throw error;
  }
}

export async function graphqlMutate({
  mutation,
  variables,
  options = {},
}: {
  mutation: DocumentNode;
  variables?: Record<string, any>;
  options?: any;
}) {
  try {
    const { data, errors } = await client.mutate({
      mutation,
      variables,
      ...options,
    });

    if (errors && Array.isArray(errors)) {
      const isAuthError = errors.some(
        (err) =>
          errorCat.includes(err.extensions?.category) ||
          err.message.includes(
            'The current user cannot perform operations on cart'
          )
      );

      if (isAuthError) {
        Logout();
        throw new ApolloError({ graphQLErrors: errors });
      }

      throw new ApolloError({ graphQLErrors: errors });
    }

    return data;
  } catch (error: any) {
    console.warn(`${error?.message || JSON.stringify(error)}`);

    if (
      error?.graphQLErrors?.some(
        (err: any) =>
          errorCat.includes(err.extensions?.category) ||
          err.message.includes(
            'The current user cannot perform operations on cart'
          )
      )
    ) {
      Logout();
    }

    throw error;
  }
}
export async function handleRequestProgress({
  url = '',
  endpoint = null,
  body,
  method = 'POST',
  headers = {},
  isFormData = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  onProgress = (percent: number) => { },
}: {
  url?: string;
  endpoint?: string | null;
  body?: unknown;
  method?: 'POST' | 'GET';
  headers?: Record<string, string>;
  isFormData?: boolean;
  onProgress?: (percent: number) => void;
}) {
  url = endpoint ? `${process.env.MAGENTO_ENDPOINT}rest/V1/${endpoint}` : url;

  if (isFormData) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    Object.keys(headers).forEach((key) =>
      xhr.setRequestHeader(key, headers[key])
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        return Promise.resolve(JSON.parse(xhr.responseText));
      } else {
        return Promise.reject(
          new Error('Request failed with status ' + xhr.status)
        );
      }
    };

    xhr.onerror = () => {
      return Promise.reject(new Error('Network error during upload'));
    };

    xhr.send(body as FormData);

    return new Promise((resolve, reject) => {
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(new Error('Upload failed'));
    });
  } else {
    const fetchBody = {
      method: method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, fetchBody);
    return response.json();
  }
}
