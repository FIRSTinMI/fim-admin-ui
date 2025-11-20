import { useSupaMutation } from "src/hooks/useSupaMutation";
import { FimSupabaseClient } from "src/supabaseContext";


const runEventStreamSetter = async (
  client: FimSupabaseClient,
  eventIds: string[]
) => {
  return fetch(
    `${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/event-streams`,
    {
      method: "POST",
      body: JSON.stringify({ eventIds }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          (await client.auth.getSession()).data.session?.access_token
        }`,
      },
    }
  ).then(async (resp) => {
    if (resp.status === 401 || resp.status === 403)
      throw new Error("You do not have permission to perform this action.");
    if (!resp.ok)
      throw new Error(
        `An error occurred while setting the event streams: ${resp.statusText}`
      );
  });
};

export const useRunEventStreamSetter = () => useSupaMutation({
    mutationFn: (
      client: FimSupabaseClient,
      { eventIds }: { eventIds: string[] }
    ) => runEventStreamSetter(client, eventIds)
});


const livestreamDelete = async (
  client: FimSupabaseClient,
  livestreamId: string
) => {
  return fetch(
    `${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/event-streams/${livestreamId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          (await client.auth.getSession()).data.session?.access_token
        }`,
      },
    }
  ).then(async (resp) => {
    if (resp.status === 401 || resp.status === 403)
      throw new Error("You do not have permission to perform this action.");
    if (!resp.ok)
      throw new Error(
        `An error occurred while setting the event streams: ${resp.statusText}`
      );
  });
};

export const useLivestreamDelete = () => useSupaMutation({
    mutationFn: (
      client: FimSupabaseClient,
      { livestreamId }: { livestreamId: string }
    ) => livestreamDelete(client, livestreamId)
});