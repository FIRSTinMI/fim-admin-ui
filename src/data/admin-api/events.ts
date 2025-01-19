import { FimSupabaseClient } from "src/supabaseContext";
import { EventTeamStatus } from "src/data/supabase/events.ts";

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

export type UpdateEventInfoRequest = {
  eventId: string,
  name: string,
  truckRouteId: number | null,
  startTime: Date,
  endTime: Date,
  timezone: string,
  status: string
};

export const updateEventInfo = async (client: FimSupabaseClient, req: UpdateEventInfoRequest) => {
  return fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/events/${encodeURIComponent(req.eventId)}`, {
    method: "PUT",
    body: JSON.stringify({
      name: req.name,
      truckRouteId: req.truckRouteId,
      startTime: req.startTime,
      endTime: req.endTime,
      timezone: req.timezone,
      status: req.status
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`
    }
  }).then(async resp => {
    if (resp.status === 401 || resp.status === 403) throw new Error("You do not have permission to perform this action.");
    if (!resp.ok) throw new Error(`An error occurred while saving the event: ${resp.statusText}`);
    return await resp.json();
  });
}

export type UpdateEventTeamRequest = {
  eventId: string,
  eventTeamId: number,
  notes: string | null,
  status: EventTeamStatus['id']
};

export const updateEventTeam = async (client: FimSupabaseClient, req: UpdateEventTeamRequest) => {
  return fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/events/${encodeURIComponent(req.eventId)}/teams/${encodeURIComponent(req.eventTeamId)}`, {
    method: "PUT",
    body: JSON.stringify({
      statusId: req.status,
      notes: req.notes
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`
    }
  }).then(async resp => {
    if (resp.status === 401 || resp.status === 403) throw new Error("You do not have permission to perform this action.");
    if (!resp.ok) throw new Error(`An error occurred while saving the event: ${resp.statusText}`);
    return await resp.json();
  });
}