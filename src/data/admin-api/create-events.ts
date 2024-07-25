import { FimSupabaseClient } from "src/supabaseContext";
import { EventSlim } from "../supabase/events";
import { parseISO } from "date-fns";

export type SyncSourceRequest = {
  overrideExisting: boolean,
  seasonId: number,
  dataSource: DataSource,
  districtCode: string | null,
  eventCodes: string[] | null
};

export type CreateEventsResponse = {
  errors: string[],
  warnings: string[],
  isSuccess: boolean,
  upsertedEvents: EventSlim[]
};

export type DataSource = "FrcEvents" | "BlueAlliance" | "OrangeAlliance";

export const createEventsFromSyncSource = async (client: FimSupabaseClient, request: SyncSourceRequest): Promise<CreateEventsResponse> => {
  return fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/events-create/sync-source`, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`,
      'Content-Type': 'application/json'
    }
  }).then(async resp => {
    const json = (await resp.json()) as CreateEventsResponse;
    json.upsertedEvents = json.upsertedEvents.map(e => {
      e.start_time = parseISO(e.start_time as unknown as string);
      e.end_time = parseISO(e.end_time as unknown as string);
      return e;
    });
    return json;
  });
}