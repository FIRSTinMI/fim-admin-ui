import { Box, Button } from "@mui/material";
import { useGetTwitchLogin } from "src/data/admin-api/twitch";

export default function Twitch() {
  const twitchLogin = useGetTwitchLogin();

  // Check if this is a response from Twitch after authorization
  // Example URL: http://localhost:5173/av-tools/twitch?code=<code>&scope=<scopes>&state=<state>
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const scope = urlParams.get("scope");
  const state = urlParams.get("state");

  const isTwitchResponse = code && scope && state;

  const getSignInUrl = async () => {
    const data = await twitchLogin.refetch();
    if (data.data) {
        console.log(data.data.authorizeUrl)
        location.href = data.data.authorizeUrl;
    }
  };

  if (isTwitchResponse) {
    return (
      <Box>
        <p>Twitch authorization response received.</p>
        <p>Code: {code}</p>
        <p>Scope: {scope}</p>
        <p>State: {state}</p>
      </Box>
    );
  }

  return (
    <Box>
      <Button variant="contained" onClick={getSignInUrl}>
        Connect to Twitch
      </Button>
    </Box>
  );
}
