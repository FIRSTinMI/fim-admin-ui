import { parseISO } from "date-fns/parseISO";
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
  event_notes?: {
    id: number,
    content: string,
    created_by: string,
    created_at: Date
  }[]
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
    .select("*,truck_routes(id,name),event_notes(*)")
    .eq('id', eventId)
    .single<Event>();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    key: data.key,
    code: data.code,
    name: data.name,
    start_time: parseISO(data.start_time as unknown as string),
    end_time: parseISO(data.end_time as unknown as string),
    status: data.status,
    truck_routes: data.truck_routes ? {
      id: data.truck_routes.id,
      name: data.truck_routes.name
    } : undefined,
    event_notes: data.event_notes ? data.event_notes.map(n => ({
      id: n.id,
      content: n.content,
      created_by: n.created_by,
      created_at: n.created_at
    })) : undefined
  } as Event;
}