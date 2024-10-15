import { FimSupabaseClient } from "src/supabaseContext";
import { EventPermission } from "../eventPermission";

export type EventStaff = {
  userId: string,
  eventId: string,
  permissions: EventPermission[]
}

export const getCurrentUserStaffForEvent = async (client: FimSupabaseClient, eventId: string): Promise<EventStaff | null> => {
  const userId = (await client.auth.getSession()).data.session?.user.id;
  if (!userId) throw new Error("Unable to get user id");

  const { data, error } = await client
    .from("event_staffs")
    .select("user_id,event_id,permissions")
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single<EventStaff>();

  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(error.message);

  return data;
}