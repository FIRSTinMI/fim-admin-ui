import { FimSupabaseClient } from "../../supabaseContext";

export type TruckRoute = {
  id: number,
  name: string
};

export const getTruckRoutes = async (client: FimSupabaseClient) => {
  const { data, error } = await client
    .from("truck_routes")
    .select<string, TruckRoute>("*,id,name");

  if (error) throw new Error(error.message);

  if (data === null) return [];

  return data;
}