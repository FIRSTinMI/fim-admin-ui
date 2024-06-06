import { FimSupabaseClient } from "../../supabaseContext";

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