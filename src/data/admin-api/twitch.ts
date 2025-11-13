import { useSupaQuery } from "src/hooks/useSupaQuery";
import { FimSupabaseClient } from "src/supabaseContext.tsx";

const getTwitchLogin = async (client: FimSupabaseClient) => {
  const redirectUri = location.href;
  console.log("Redirect URI:", redirectUri);
  const scopes = [
    encodeURIComponent("channel:manage:broadcast"),
    encodeURIComponent("channel:manage:videos"),
    encodeURIComponent("channel:read:stream_key")
  ]
  return fetch(
    `${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/twitch/connect?redirectUri=${encodeURIComponent(redirectUri)}&scope=${scopes.join("+")}`,
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
        `An error occurred while connecting to Twitch: ${resp.statusText}`
      );
    return resp.json();
  });
};

export const useGetTwitchLogin = () => {
  return useSupaQuery({
    queryFn: (client: FimSupabaseClient) => getTwitchLogin(client),
    enabled: false,
    queryKey: ['getTwitchLogin']
  });
};
