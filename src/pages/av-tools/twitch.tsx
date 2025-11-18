import { Button, Stack, Typography, Box, Chip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  useGetActiveTwitchScopes,
  useGetTwitchLogin,
  useUpdateTwitchAuth,
} from "src/data/admin-api/twitch";
import Timestamp from "src/shared/Timestamp";

export default function Twitch() {
  const twitchLogin = useGetTwitchLogin();
  const {
    data: activeScopes,
    isError: activeScopesError,
    isLoading: activeScopesLoading,
    refetch: refetchActiveScopes,
  } = useGetActiveTwitchScopes();
  const { mutate: updateTwitchAuth } = useUpdateTwitchAuth();

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
      location.href = data.data.authorizeUrl;
    }
  };

  if (isTwitchResponse) {
    // Save the Twitch authorization code
    updateTwitchAuth({ code, scope });
    // Remove the query parameters from the URL
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }

  return (
    <Stack spacing={2} direction={"column"}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Twitch Accounts</Typography>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => refetchActiveScopes()}
          >
            Refresh Scopes
          </Button>
          <Button variant="contained" onClick={getSignInUrl}>
            Add or Reconnect Twitch Account
          </Button>
        </Box>
      </Box>

      {activeScopesLoading ? (
        <Typography>Loading active scopes...</Typography>
      ) : activeScopesError ? (
        <Typography color="error">Failed to load active scopes</Typography>
      ) : !activeScopes || Object.keys(activeScopes).length === 0 ? (
        <Typography>No active scopes found.</Typography>
      ) : (
        <div style={{ height: 360, width: "100%" }}>
          <DataGrid
            rows={Object.entries(activeScopes).map(([key, val]) => ({
              id: key,
              scopes: (val as any).scopes,
              expiresAt: (val as any).expiresAt,
            }))}
            columns={[
              { field: "id", headerName: "Account", width: 200 } as GridColDef,
              {
                field: "scopes",
                headerName: "Scopes",
                flex: 1,
                renderCell: (params: any) => {
                  const value = params.value as string | undefined;
                  if (!value) return null;
                  const parts = value.split(" ").filter(Boolean);
                  return (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        mt: 1.5,
                      }}
                    >
                      {parts.map((p) => (
                        <Chip key={p} size="small" label={p} />
                      ))}
                    </Box>
                  );
                },
              } as GridColDef,
              {
                field: "expiresAt",
                headerName: "Expires",
                width: 220,
                renderCell: (params: any) => {
                  const value = params.value as string;
                  return <Timestamp timestamp={value} relative={true} />;
                },
              } as GridColDef,
            ]}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
          />
        </div>
      )}
    </Stack>
  );
}
