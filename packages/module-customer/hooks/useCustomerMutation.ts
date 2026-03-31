import {
  ApolloCache,
  DefaultContext,
  MutationHookOptions,
  MutationTuple,
  OperationVariables,
  TypedDocumentNode,
  useMutation,
} from '@apollo/client';
import { useCreateEmptyCart } from '@packages/module-quote/hooks';
import { Logout } from 'store'; // import your logout function
import { errorCat } from '@utils/Constants';
import { DocumentNode } from 'graphql';
import { useToken } from './useToken';

type TContext = DefaultContext;

export function useCustomerMutation<
  TData = any,
  TVariables = OperationVariables,
  TCache extends ApolloCache<any> = ApolloCache<any>,
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: MutationHookOptions<TData, TVariables, TContext, TCache>
): MutationTuple<TData, TVariables, TContext, TCache> {
  const token = useToken();
  const emptyCart = useCreateEmptyCart();
  options = options || {};

  options.fetchPolicy = 'no-cache';

  let context = options.context || {};
  let headers = context.headers || {};
  headers = {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
  context.headers = headers;
  options.context = context;

  const userOnError = options.onError;

  options.onError = (error) => {
    if (
      error.graphQLErrors?.some(
        (err) =>
          errorCat.includes(err.extensions?.category as string) ||
          err.message.includes(
            'The current user cannot perform operations on cart'
          )
      )
    ) {
      Logout();
    } else if (
      error.graphQLErrors?.some((err) =>
        err.message.includes("The cart isn't active.")
      )
    ) {
      emptyCart();
    }
    if (typeof userOnError === 'function') {
      userOnError(error);
    }
  };

  return useMutation(mutation, options);
}
