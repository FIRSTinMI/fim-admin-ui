import { Link as RouterLink, useParams } from "react-router-dom";
import useHasGlobalPermission from "src/hooks/useHasGlobalPermission";
import {
  TruckRoute,
  useGetTruckRoute,
  useGetUpcomingEventsForRoute,
} from "src/data/supabase/truckRoutes";
import { GlobalPermission } from "src/data/globalPermission.ts";
import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Loading } from "src/shared/Loading.tsx";
import { useForm } from "@tanstack/react-form";
import {
  UpdateTruckRouteRequest,
  useUpdateTruckRoute,
} from "src/data/admin-api/truck-routes.ts";
import { UseQueryResult } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import { useTitle } from "src/hooks/useTitle.ts";
import { formatEventDate } from "src/shared/util.ts";
import { useGetEquipmentOfType } from "src/data/supabase/equipment.ts";
import ListItemText from "@mui/material/ListItemText";
import { useEffect } from "react";

function EditFormOrName({
  routeQuery,
  hasManagePerm,
}: {
  routeQuery: UseQueryResult<TruckRoute | null, unknown>;
  hasManagePerm: boolean;
}) {
  const updateRouteMutation = useUpdateTruckRoute();
  const equipmentList = useGetEquipmentOfType(-1);


  const form = useForm<Omit<UpdateTruckRouteRequest, "routeId">>({
    defaultValues: {
      name: routeQuery?.data?.name ?? "",
      streamingConfig: routeQuery.data?.streamingConfig ?? {
        Channel_Type: null,
        Channel_Id: "",
      },
      equipmentIds:
        equipmentList?.data
          ?.filter((e) => e.truckRoute?.id == routeQuery?.data?.id)
          .map((e) => e.id) ?? [],
    },
    onSubmit: async (form) => {
      const routeId = routeQuery?.data?.id;

      if (!routeId) {
        throw new Error("Route ID was null");
      }

      await updateRouteMutation.mutateAsync({
        routeId: routeId,
        name: form.value.name,
        equipmentIds: form.value.equipmentIds,
        streamingConfig: form.value.streamingConfig,
      });
    },
  });

  useEffect(() => {
    if (!equipmentList.data) return;
    form.setFieldValue(
      "equipmentIds",
      equipmentList.data
        ?.filter((e) => e.truckRoute?.id === routeQuery.data!.id)
        .map((e) => e.id) ?? []
    );
  }, [equipmentList.data]);

  if (equipmentList.isPending) return;

  if (!hasManagePerm) {
    return <Typography variant={"h3"}>{routeQuery.data?.name}</Typography>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FormControl fullWidth sx={{ mb: 2 }}>
        <form.Field name="name">
          {({ state, handleChange, handleBlur }) => (
            <TextField
              label="Name"
              variant="outlined"
              value={state.value ?? ""}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
            />
          )}
        </form.Field>
      </FormControl>

      {equipmentList.isSuccess && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <form.Field name="equipmentIds">
            {({ state, handleChange }) => (
              <>
                <InputLabel id="equipment-label">Equipment</InputLabel>
                <Select
                  labelId="equipment-label"
                  id="equipment"
                  multiple
                  value={state.value}
                  onChange={(e) =>
                    handleChange(
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : (e.target.value as string[])
                    )
                  }
                  input={<OutlinedInput label="Equipment" />}
                  renderValue={(selected) =>
                    equipmentList.data
                      .filter((e) => (selected ?? []).includes(e.id))
                      .map((e) => `${e.name} (${e.equipmentType?.name})`)
                      .join(", ")
                  }
                >
                  {equipmentList.data!.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      <Checkbox
                        checked={(state.value ?? []).includes(item.id)}
                      />
                      <ListItemText
                        primary={`${item.name} (${item.equipmentType?.name})`}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </>
            )}
          </form.Field>
        </FormControl>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <form.Field name="streamingConfig.Channel_Type">
            {({ state, handleChange, handleBlur }) => (
              <>
                <InputLabel id="streaming-platform-label">Streaming Platform</InputLabel>
                <Select
                  labelId="streaming-platform-label"
                  id="streaming-platform"
                  value={state.value ?? ""}
                  onChange={(e) => handleChange(e.target.value as string)}
                  onBlur={handleBlur}
                  label="Streaming Platform"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="youtube">YouTube</MenuItem>
                  <MenuItem value="twitch">Twitch</MenuItem>
                </Select>
              </>
            )}
          </form.Field>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <form.Field name="streamingConfig.Channel_Id">
            {({ state, handleChange, handleBlur }) => (
              <TextField
                label="Streaming Channel ID"
                variant="outlined"
                value={state.value ?? ""}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
              />
            )}
          </form.Field>
        </FormControl>
      </Stack>

      <Button variant="contained" type="submit" loading={updateRouteMutation.isPending}>
        Save
      </Button>
    </form>
  );
}

function TruckRoutesManage() {
  const params = useParams();
  const hasEventsView = useHasGlobalPermission([GlobalPermission.Events_View]);
  const hasEquipmentManage = useHasGlobalPermission([
    GlobalPermission.Equipment_Manage,
  ]);

  const route = useGetTruckRoute(parseInt(params["id"]!));
  useTitle(route.data?.name);
  const eventsQuery = useGetUpcomingEventsForRoute(parseInt(params["id"]!));

  if (route.isLoading) return <Loading />;

  if (route.isSuccess && !route.data)
    return <Alert severity={"error"}>Unable to load route</Alert>;

  return (
    <>
      <EditFormOrName routeQuery={route} hasManagePerm={hasEquipmentManage} />
      {hasEventsView && eventsQuery.isSuccess && (
        <section>
          <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
            Upcoming events
          </Typography>
          {eventsQuery.data.length === 0 ? (
            <p>No events are coming up for this route</p>
          ) : (
            <DataGrid
              rows={eventsQuery.data}
              columns={[
                {
                  field: "name",
                  headerName: "Name",
                  flex: 1,
                  minWidth: 150,
                  renderCell: (params) => (
                    <Link
                      component={RouterLink}
                      to={`/events/${params.row.id}`}
                    >
                      {params.value}
                    </Link>
                  ),
                },
                {
                  field: "start_time",
                  headerName: "Start",
                  width: 110,
                  valueFormatter: formatEventDate,
                  type: "dateTime",
                },
                {
                  field: "end_time",
                  headerName: "End",
                  width: 110,
                  valueFormatter: formatEventDate,
                  type: "dateTime",
                },
              ]}
            />
          )}
        </section>
      )}
    </>
  );
}

export default TruckRoutesManage;
