import { FimSupabaseClient } from "src/supabaseContext.tsx";
import { useSupaMutation } from "src/hooks/useSupaMutation.ts";
import { useQueryClient } from "@tanstack/react-query";

export type UpdateTruckRouteRequest = {
  routeId: number,
  name: string,
  equipmentIds: string[] | null
};

const updateTruckRoute = async (client: FimSupabaseClient, request: UpdateTruckRouteRequest) => {
  return fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/routes/${encodeURIComponent(request.routeId)}`, {
    method: "PUT",
    body: JSON.stringify({...request, routeId: undefined}),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`
    }
  }).then(async resp => {
    if (resp.status === 401 || resp.status === 403) throw new Error("You do not have permission to perform this action.");
    if (!resp.ok) throw new Error(`An error occurred while saving the match: ${resp.statusText}`);
  });
} 

export const useUpdateTruckRoute = () => {
  const queryClient = useQueryClient();
  return useSupaMutation({
    mutationFn: (client: FimSupabaseClient, variables: UpdateTruckRouteRequest) => updateTruckRoute(client, variables),
    onSettled: async (_, __, variables: UpdateTruckRouteRequest) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["getTruckRoute", variables.routeId]
        }),
        queryClient.invalidateQueries({
          queryKey: ["getTruckRoutes"]
        })
      ]);
    }
  });
};