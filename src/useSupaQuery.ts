import { QueryKey, UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { FimSupabaseClient, SupabaseContext } from "./supabaseContext";

type UseSupaQueryOptions<TQueryFnData, TError, TData, TQueryKey extends QueryKey>
  = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryFn'> & {
    queryFn: (client: FimSupabaseClient) => Promise<TQueryFnData>
  };

/**
 * A version of `react-query`'s `useQuery` which passes in the Supabase client to the `queryFn` as
 * the first parameter
 * @see useQuery
 */
export function useSupaQuery<
  TQueryKey extends [string, ...unknown[]],
  TQueryFnData,
  TError,
  TData = TQueryFnData
>(
  options: UseSupaQueryOptions<TQueryFnData, TError, TData, TQueryKey>
) {
  const client = useContext(SupabaseContext);
  return useQuery({
    ...options,
    queryKey: options.queryKey,
    queryFn: async () => {
      if (!client) throw new Error('No Supabase client defined');
      if (!options.queryFn) throw new Error('useSupaQuery must define a query function');
      return options.queryFn(client);
    },
  });
}