import parseISO from "date-fns/parseISO";
import { FimSupabaseClient } from "../../supabaseContext";
import { useSupaQuery } from "src/hooks/useSupaQuery";

export type EventSlim = {
  id: string
  key: string,
  code?: string,
  name: string,
  start_time: Date,
  end_time: Date,
  timezone: string,
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

  return data.map(e => mapDbToEvent(e));
}

export const getEvent = async (client: FimSupabaseClient, eventId: string): Promise<Event> => {
  const { data, error } = await client
    .from("events")
    .select("*,truck_routes(id,name),event_notes(*)")
    .eq('id', eventId)
    .single<Event>();

  if (error) throw new Error(error.message);

  return mapDbToEvent(data);
}

const mapDbToEvent = (db: Event): Event => {
  return {
    id: db.id,
    key: db.key,
    code: db.code,
    name: db.name,
    start_time: parseISO(db.start_time as unknown as string),
    end_time: parseISO(db.end_time as unknown as string),
    timezone: db.timezone,
    status: db.status,
    truck_routes: db.truck_routes ? {
      id: db.truck_routes.id,
      name: db.truck_routes.name
    } : undefined,
    event_notes: db.event_notes ? db.event_notes.map(n => ({
      id: n.id,
      content: n.content,
      created_by: n.created_by,
      created_at: parseISO(n.created_at as unknown as string)
    })) : undefined
  } as Event;
}

export const getEventQueryKey = (eventId: string) => ['event', eventId] as [string, ...unknown[]];
export const useGetEventQuery = (eventId: string, refetch: boolean = true) => useSupaQuery({
  queryKey: getEventQueryKey(eventId),
  queryFn: (client) => getEvent(client, eventId),
  refetchOnWindowFocus: refetch
});