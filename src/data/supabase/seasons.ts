import { FimSupabaseClient } from "../../supabaseContext";
import {useSupaQuery} from "src/hooks/useSupaQuery.ts";

export type Season = {
  id: number,
  name: string,
  levels: {
    name: string
  }
};

export const getSeasons = async (client: FimSupabaseClient) => {
  const { data, error } = await client
    .from("seasons")
    .select<string, Season>("id,name,levels(name)");

  if (error) throw new Error(error.message);

  if (data === null) return [];

  return data;
}

export const useGetSeasons = () => useSupaQuery({
  queryKey: ["getSeasons"],
  queryFn: (client) => getSeasons(client)
});