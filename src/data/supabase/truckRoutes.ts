import { formatISO } from "date-fns";
import { FimSupabaseClient } from "../../supabaseContext";
import { Event } from "./events";

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

export const getUpcomingEventsForRoute = async(client: FimSupabaseClient, routeId: number) => {
  const { data, error } = await client
    .from("events")
    .select<string, Event>("*")
    .eq("truck_route_id", routeId)
    .gte("end_time", formatISO(new Date()));

    if (error) throw new Error(error.message ?? error.code);

    if (data === null) return [];

    return data;
}