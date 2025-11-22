import { useQueryClient } from "@tanstack/react-query";
import { useSupaMutation } from "src/hooks/useSupaMutation";
import { useSupaQuery } from "src/hooks/useSupaQuery";
import { FimSupabaseClient } from "src/supabaseContext.tsx";

const getYoutubeLogin = async (client: FimSupabaseClient) => {
  const redirectUri = location.href.split("?")[0];
  return fetch(
    `${
      import.meta.env.PUBLIC_ADMIN_API_URL
    }/api/v1/youtube/connect?redirectUri=${encodeURIComponent(
      redirectUri
    )}`,
    {
      method: "GET",
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
        `An error occurred while connecting to Youtube: ${resp.statusText}`
      );
    return resp.json();
  });
};

export const useGetYoutubeLogin = () => {
  return useSupaQuery({
    queryFn: (client: FimSupabaseClient) => getYoutubeLogin(client),
    enabled: false,
    queryKey: ["getYoutubeLogin"],
  });
};

const getActiveYoutubeScopes = async (client: FimSupabaseClient) => {
  return fetch(
    `${
      import.meta.env.PUBLIC_ADMIN_API_URL
    }/api/v1/youtube/scopes`,
    {
      method: "GET",
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
        `An error occurred while checking Youtube credentials: ${resp.statusText}`
      );
    return resp.json();
  });
};

export const useGetActiveYoutubeScopes = () => {
  return useSupaQuery({
    queryFn: (client: FimSupabaseClient) => getActiveYoutubeScopes(client),
    queryKey: ["activeYoutubeScopes"],
  });
};

const updateYoutubeAuth = async (
  client: FimSupabaseClient,
  code: string,
  scope: string
) => {
  return fetch(
    `${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/youtube/set-code`,
    {
      method: "POST",
      body: JSON.stringify({ code, scope, redirectUri: location.href.split("?")[0] }),
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
        `An error occurred while saving the Youtube authorization: ${resp.statusText}`
      );
  });
};

export const useUpdateYoutubeAuth = () => {
  const queryClient = useQueryClient();
  return useSupaMutation({
    mutationFn: (
      client: FimSupabaseClient,
      { code, scope }: { code: string; scope: string; }
    ) => updateYoutubeAuth(client, code, scope),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["activeYoutubeScopes"],
        }),
      ]);
    },
  });
};

const stopYoutubeStream = async (
  client: FimSupabaseClient,
  broadcastId: string,
  accountId: string
) => {
  return fetch(
    `${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/youtube/broadcasts/${broadcastId}/stop?acctEmail=${encodeURIComponent(accountId)}`,
    {
      method: "POST",
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
        `An error occurred while stopping the Youtube stream: ${resp.statusText}`
      );
  });
};

export const useStopYoutubeStream = () => {
  return useSupaMutation({
    mutationFn: (
      client: FimSupabaseClient,
      { broadcastId, accountId }: { broadcastId: string; accountId: string; }
    ) => stopYoutubeStream(client, broadcastId, accountId)
  });
};

const getYoutubeStreamStatuses = async (client: FimSupabaseClient, accountId: string): Promise<YoutubeStreamStatus[]> => {
  return fetch(
    `${
      import.meta.env.PUBLIC_ADMIN_API_URL
    }/api/v1/youtube/broadcasts/status?acctEmail=${encodeURIComponent(accountId)}`,
    {
      method: "GET",
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
        `An error occurred while checking Youtube statuses: ${resp.statusText}`
      );
    return resp.json();
  });
};

export const useGetYoutubeStreamStatuses = (accountId: string) => {
  return useSupaQuery({
    queryFn: (client: FimSupabaseClient) => getYoutubeStreamStatuses(client, accountId),
    queryKey: ["youtubeStreamStatuses", accountId],
    enabled: !!accountId,
    staleTime: 5000
  });
};

export type YoutubeStreamStatus = {
  broadcastId: string,
  isLive: boolean,
  lifeCycleStatus: "ready" | "complete" | "live" | "liveStarting" | "revoked" | "testStarting" | "testing", 
  privacyStatus: "public" | "private" | "unlisted",
  scheduledEndTime: string,
  scheduledStartTime: string,
}