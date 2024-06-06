import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { FimSupabaseClient, SupabaseContext } from "./supabaseContext";

type UseSupaMutationOptions<TData, TError, TVariables, TContext>
  = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> & {
    mutationFn: (client: FimSupabaseClient, variables: TVariables) => Promise<TData>
  };

/**
 * A version of `react-query`'s `useMutation` which passes in the Supabase client to the `mutationFn` as
 * the first parameter
 * @see useQuery
 */
export function useSupaMutation<TData, TError, TVariables, TContext>(
  options: UseSupaMutationOptions<TData, TError, TVariables, TContext>
) {
  const client = useContext(SupabaseContext);
  return useMutation({
    ...options,
    mutationFn: async (variables: TVariables) => {
      if (!client) throw new Error('No Supabase client defined');
      if (!options.mutationFn) throw new Error('useSupaMutation must define a mutation function');
      return options.mutationFn(client, variables);
    },
  });
}