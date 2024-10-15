import { SupabaseClient } from "@supabase/supabase-js";
import { useSupaQuery } from "src/hooks/useSupaQuery.ts";

export type EquipmentType = {
  id: number,
  name: string
};

export const getEquipmentTypes = async (client: SupabaseClient): Promise<EquipmentType[]> => {
  const { data, error } = await client
    .from("equipment_types")
    .select("id,name")
    .returns<EquipmentType[]>();

  if (error?.code === "PGRST116") return [];
  if (error) throw new Error(error.message);
  
  return data !== null ? data : [];
}

export const useGetEquipmentTypes =() => useSupaQuery({
  queryKey: ["getEquipmentTypes"],
  queryFn: (client) => getEquipmentTypes(client)
});