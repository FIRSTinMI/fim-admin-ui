import { formatISO } from "date-fns";
import { FimSupabaseClient } from "../../supabaseContext";
import { Event, mapDbToEvent } from "./events";
import { useSupaQuery } from "src/hooks/useSupaQuery.ts";
import useHasGlobalPermission from "src/hooks/useHasGlobalPermission.ts";
import { GlobalPermission } from "src/data/globalPermission.ts";

export type StreamingConfig = {
  Channel_Type: "twitch" | "youtube" | "" | null;
  Channel_Id: string;
};

export type TruckRoute = {
  id: number;
  name: string;
  streaming_config?: StreamingConfig;
};

export const getTruckRoutes = async (client: FimSupabaseClient) => {
  const { data, error } = await client
    .from("truck_routes")
    .select("id,name")
    .order("name");

  if (error) throw new Error(error.message);

  if (data === null) return [] as TruckRoute[];

  return data.map(mapDbToTruckRoute);
};

export const useGetTruckRoutes = () =>
  useSupaQuery({
    queryKey: ["getTruckRoutes"],
    queryFn: async (client) => {
      return await getTruckRoutes(client);
    },
  });

export const getTruckRoute = async (client: FimSupabaseClient, id: number) => {
  const { data, error } = await client
    .from("truck_routes")
    .select("id,name,streaming_config")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  if (data === null) return null;

  return mapDbToTruckRoute(data);
};

export const useGetTruckRoute = (id: number) =>
  useSupaQuery({
    queryKey: ["getTruckRoute", id],
    queryFn: async (client) => {
      return await getTruckRoute(client, id);
    },
  });

export const getUpcomingEventsForRoute = async (
  client: FimSupabaseClient,
  routeId: number
) => {
  const { data, error } = await client
    .from("events")
    .select<string, Event>("*")
    .eq("truck_route_id", routeId)
    .gte("end_time", formatISO(new Date()));

  if (error) throw new Error(error.message ?? error.code);

  if (data === null) return [];

  return data.map(mapDbToEvent);
};

export const useGetUpcomingEventsForRoute = (routeId: number) => {
  const hasPermission = useHasGlobalPermission([GlobalPermission.Events_View]);
  return useSupaQuery({
    queryKey: ["getUpcomingEventsForRoute", routeId],
    queryFn: async (client) => {
      return await getUpcomingEventsForRoute(client, routeId);
    },
    enabled: hasPermission,
  });
};

export const mapDbToTruckRoute = (dbRoute: any) =>
  ({
    id: dbRoute.id,
    name: dbRoute.name,
    streaming_config: dbRoute.streaming_config,
  } as TruckRoute);
