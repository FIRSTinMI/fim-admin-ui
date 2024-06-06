import { FimSupabaseClient } from "../../supabaseContext";

export type EventSlim = {
  id: string
  key: string,
  code?: string,
  name: string,
  start_time: Date,
  end_time: Date,
  status: string,
  truck_routes?: {
    id: number,
    name: string
  }
};

export type Event = EventSlim & {
  todo: string
};

export const getEventsForSeason = async (client: FimSupabaseClient, seasonId: number): Promise<EventSlim[]> => {
  const { data, error } = await client
    .from("events")
    .select<string, EventSlim>("id,key,code,name,start_time,end_time,status,truck_routes(id,name)")
    .eq('season_id', seasonId);

  if (error) throw new Error(error.message);

  if (data === null) return [];

  return data;
}

export const getEvent = async (client: FimSupabaseClient, eventId: string): Promise<Event> => {
  const { data, error } = await client
    .from("events")
    .select("*,truck_routes(id,name)")
    .eq('id', eventId)
    .single<Event>();

  if (error) throw new Error(error.message);

  return data;
}