import { SupabaseClient } from "@supabase/supabase-js";
import { useSupaQuery } from "src/hooks/useSupaQuery.ts";
import { mapDbToTruckRoute, TruckRoute } from "src/data/supabase/truckRoutes.ts";

export type EquipmentType = {
  id: number,
  name: string
};

type DefaultConfiguration = any;
export type Equipment<TConfig = DefaultConfiguration> = {
  id: string,
  name: string,
  equipmentType: EquipmentType | null,
  teamviewerId: string | null,
  slackUserId: string | null,
  truckRoute: TruckRoute | null,
  configuration: TConfig
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

export const useGetEquipmentTypes = () => useSupaQuery({
  queryKey: ["getEquipmentTypes"],
  queryFn: (client) => getEquipmentTypes(client)
});

export const getEquipmentOfType = async <TConfig = DefaultConfiguration>(client: SupabaseClient, typeId: number)
  : Promise<Equipment<TConfig>[]> => {
  const { data, error } = await client
    .from("equipment")
    .select("id,name,teamviewer_id,slack_user_id,truck_routes(id,name),equipment_types(id,name),configuration")
    .eq('equipment_type_id', typeId)
    .order('name', {ascending: true})
    .returns<any[]>();

  if (error?.code === "PGRST116") return [];
  if (error) throw new Error(error.message);

  return data !== null ? data.map(mapDbToEquipment) : [];
};

export const useGetEquipmentOfType = <TConfig = DefaultConfiguration>(typeId: number) => useSupaQuery({
  queryKey: ["equipmentOfType", typeId],
  queryFn: (client) => getEquipmentOfType<TConfig>(client, typeId)
});

export const mapDbToEquipment = (db: any): Equipment => {
  return {
    id: db.id,
    name: db.name,
    equipmentType: db.equipment_type ? db.equipment_type : null,
    teamviewerId: db.teamviewer_id,
    slackUserId: db.slack_user_id,
    truckRoute: db.truck_route ? mapDbToTruckRoute(db.truck_route) : null,
    configuration: db.configuration
  };
};