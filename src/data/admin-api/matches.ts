import { FimSupabaseClient } from "src/supabaseContext.tsx";
import { useSupaMutation } from "src/hooks/useSupaMutation.ts";
import { useQueryClient } from "@tanstack/react-query";

export type SetMatchIsDiscardedRequest = {
  eventId: string,
  matchId: number,
  isDiscarded: boolean
};

const setMatchIsDiscarded = async (client: FimSupabaseClient, { matchId, isDiscarded }: SetMatchIsDiscardedRequest) => {
  return fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/matches/${encodeURIComponent(matchId)}/is-discarded`, {
    method: "PUT",
    body: JSON.stringify(isDiscarded),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`
    }
  }).then(async resp => {
    if (resp.status === 401 || resp.status === 403) throw new Error("You do not have permission to perform this action.");
    if (!resp.ok) throw new Error(`An error occurred while saving the match: ${resp.statusText}`);
  });
} 

export const useSetMatchIsDiscarded = () => {
  const queryClient = useQueryClient();
  return useSupaMutation({
    mutationFn: (client: FimSupabaseClient, variables: SetMatchIsDiscardedRequest) => setMatchIsDiscarded(client, variables),
    onSettled: async (_, __, variables: SetMatchIsDiscardedRequest) => {
      await queryClient.invalidateQueries({
        queryKey: ["getMatchesForEvent", variables.eventId]
      });
    }
  });
};