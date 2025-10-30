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

export type EquipmentLog = {
  id: number,
  equipment_id: string,
  log_time_utc: string,
  log_message: string,
  severity: "Debug" | "Info" | "Warn" | "Error" | "Fatal",
  extra_info?: object,
  category: string,
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
  const baseQ = client
    .from("equipment")
    .select("id,name,teamviewer_id,slack_user_id,truck_routes(id,name),equipment_types(id,name),configuration")

  if (typeId !== -1) {
    baseQ.eq('equipment_type_id', typeId)
  }

  const { data, error } = await baseQ
    .order('name', { ascending: true })
    .returns<any[]>();

  if (error?.code === "PGRST116") return [];
  if (error) throw new Error(error.message);

  return data !== null ? data.map(mapDbToEquipment) : [];
};

export const useGetEquipmentOfType = <TConfig = DefaultConfiguration>(typeId: number) => useSupaQuery({
  queryKey: ["equipmentOfType", typeId],
  queryFn: (client) => getEquipmentOfType<TConfig>(client, typeId)
});

export const getEquipmentLogs = async (
  client: SupabaseClient,
  equipmentId: string | string[],
  size: number,
  offset: number,
  categories: string[] | "*",
  severities: string[] | "*"
): Promise<EquipmentLog[]> => {
  const baseQ = client
    .from("equipment_logs")
    .select("*")

  if (equipmentId !== "*") {
    if (Array.isArray(equipmentId)) {
      baseQ.in('equipment_id', equipmentId)
    } else {
      baseQ.eq('equipment_id', equipmentId);
    }
  }

  if (categories !== "*") {
    baseQ.in('category', categories);
  }

  if (severities !== "*") {
    baseQ.in('severity', severities);
  }

  const { data, error } = await baseQ
    .order('log_time_utc', { ascending: false })
    .range(offset, offset + size - 1)
    .returns<EquipmentLog[]>();

  if (error?.code === "PGRST116") return [];
  if (error) throw new Error(error.message);

  return data !== null ? data : [];
}

export const useGetEquipmentLogs = (
  equipmentId: string | string[],
  size: number = 10,
  offset: number = 0,
  categories: string[] | "*",
  severities: string[] | "*"
) => useSupaQuery({
  queryKey: ["equipmentLogs", equipmentId, size, offset, categories, severities],
  queryFn: (client) => getEquipmentLogs(client, equipmentId, size, offset, categories, severities)
});

export const getEquipmentById = async <TConfig = DefaultConfiguration>(client: SupabaseClient, id: string) => {
  const { data, error } = await client
    .from("equipment")
    .select("id,name,teamviewer_id,slack_user_id,truck_routes(id,name),equipment_types(id,name),configuration")
    .eq('id', id)
    .single()
    .returns<Equipment<TConfig>>();

  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(error.message);

  return data !== null ? mapDbToEquipment(data) : null;
}

export const getEquipmentByIdQueryKey = (id: string) => ["equipment", id];
export const useGetEquipmentById = <TConfig = DefaultConfiguration>(id: string) => useSupaQuery({
  queryKey: getEquipmentByIdQueryKey(id),
  queryFn: (client) => getEquipmentById<TConfig>(client, id)
});

export const mapDbToEquipment = (db: any): Equipment => {
  return {
    id: db.id,
    name: db.name,
    equipmentType: db.equipment_type ? db.equipment_type : db.equipment_types ? db.equipment_types : null,
    teamviewerId: db.teamviewer_id,
    slackUserId: db.slack_user_id,
    truckRoute: db.truck_routes ? mapDbToTruckRoute(db.truck_routes) : null,
    configuration: db.configuration
  };
};