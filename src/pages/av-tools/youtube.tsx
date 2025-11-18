import { Button, Stack, Typography, Box, Chip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect } from "react";
import { useGetActiveYoutubeScopes, useGetYoutubeLogin, useUpdateYoutubeAuth } from "src/data/admin-api/youtube";
import Timestamp from "src/shared/Timestamp";

export default function Youtube() {
  const youtubeLogin = useGetYoutubeLogin();
  const {
    data: activeScopes,
    isError: activeScopesError,
    isLoading: activeScopesLoading,
    refetch: refetchActiveScopes,
  } = useGetActiveYoutubeScopes();
  const { mutate: updateYoutubeAuth } = useUpdateYoutubeAuth();

  // Check if this is a response from Youtube after authorization
  // Example URL: http://localhost:5173/av-tools/youtube?code=<code>&scope=<scopes>
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const scope = urlParams.get("scope");

  const isYoutubeResponse = code && scope;

  const getSignInUrl = async () => {
    const data = await youtubeLogin.refetch();
    if (data.data) {
      location.href = data.data.authorizeUrl;
    }
  };

  useEffect(() => {
    if (isYoutubeResponse) {
      // Save the Youtube authorization code
      updateYoutubeAuth({ code, scope });
      // Remove the query parameters from the URL
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  return (
    <Stack spacing={2} direction={"column"}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Youtube Accounts</Typography>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => refetchActiveScopes()}
          >
            Refresh Scopes
          </Button>
          <Button variant="contained" onClick={getSignInUrl}>
            Add or Reconnect Google Account
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
