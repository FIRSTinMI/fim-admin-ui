import { FimSupabaseClient } from "src/supabaseContext";

export type CreateEventNoteRequest = {
  eventId: string,
  content: string
};

export const createEventNote = async (client: FimSupabaseClient, req: CreateEventNoteRequest) => {
  return fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/events/${encodeURIComponent(req.eventId)}/notes`, {
    method: "POST",
    body: JSON.stringify({
      content: req.content
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`
    }
  }).then(resp => resp.json());
}