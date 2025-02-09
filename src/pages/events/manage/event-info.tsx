import { LoadingButton } from "@mui/lab";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { updateEventInfo, UpdateEventInfoRequest } from "src/data/admin-api/events";
import { EventStatus, eventStatusToShortDescription } from "src/data/eventStatus";
import { getEventQueryKey, getEventsForSeasonQueryKey, useGetEvent } from "src/data/supabase/events";
import { getTruckRoutes } from "src/data/supabase/truckRoutes";
import { useSupaMutation } from "src/hooks/useSupaMutation";
import { useSupaQuery } from "src/hooks/useSupaQuery";
import { Loading } from "src/shared/Loading";

function EventsManageEventInfo() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const eventQuery = useGetEvent(id!, false);
  const truckRoutesQuery = useSupaQuery({
    queryKey: ['truckRoutes'],
    queryFn: (client) => getTruckRoutes(client)
  });

  const updateInfoMutation = useSupaMutation({
    mutationFn: (client, req: UpdateEventInfoRequest) => updateEventInfo(client, req),
    onSettled: async () => {
      await Promise.all([queryClient.invalidateQueries({
        queryKey: getEventsForSeasonQueryKey(eventQuery.data?.season_id ?? null)
      }), queryClient.invalidateQueries({
        queryKey: getEventQueryKey(eventQuery.data?.id)
      })]);
    }
  });

  const form = useForm<{
    name: string,
    truckRouteId: number | null,
    startTime: Date | null,
    endTime: Date | null,
    timezone: string,
    status: string
  }>({
    defaultValues: {
      name: "",
      truckRouteId: null,
      startTime: new Date(),
      endTime: new Date(),
      timezone: "",
      status: ""
    },
    onSubmit: async (props) => {
      const { value } = props;
      if (!id) {
        throw new Error("Event ID was null");
      }

      await updateInfoMutation.mutateAsync({
        eventId: id,
        name: value.name,
        truckRouteId: value.truckRouteId ? value.truckRouteId : null,
        startTime: value.startTime!,
        endTime: value.endTime!,
        timezone: value.timezone,
        status: value.status
      });
    }
  });

  useEffect(() => {
    if (!eventQuery.data || form.state.isDirty) {
      return;
    }

    const { data } = eventQuery;
    form.update({
      defaultValues: {
        name: data.name,
        truckRouteId: data.truck_routes?.id ?? null,
        startTime: data.start_time,
        endTime: data.end_time,
        timezone: data.time_zone,
        status: data.status
      }
    });
  }, [eventQuery, form]);

  const pcTimezone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  if (eventQuery.isPending) {
    return <Loading />;
  }

  return (eventQuery.isSuccess && <>
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ maxWidth: '800px' }}>
          {updateInfoMutation.isError &&
            <Alert sx={{ mb: 4 }} severity="error" aria-live="assertive">{updateInfoMutation.error
              ? (updateInfoMutation.error as Error).message
              : "An error occurred saving your changes."}</Alert>
          }
          <form.Field name="name" validators={{
            onChange: ({value}) => !value ? "Name is required" : undefined
          }}>
            {({ state, handleChange, handleBlur }) => (
              <TextField
                fullWidth
                label="Name"
                required
                error={state.meta.errors.length > 0}
                helperText={state.meta.errors.join(', ')}
                value={state.value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur} />
            )}
          </form.Field>

          <form.Field name="status" validators={{
            onChange: ({value}) => !value ? "Status is required" : undefined
          }}>
            {({ state, handleChange, handleBlur }) => (
              <FormControl fullWidth sx={{ mt: 3 }}>
                <InputLabel id="statusLabel" required>Status</InputLabel>
                <Select
                  labelId="statusLabel"
                  value={state.value ? state.value : ""}
                  label="Status"
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                >
                  {Object.values(EventStatus).map(s => <MenuItem key={s} value={s}>{eventStatusToShortDescription(s)}</MenuItem>)}
                </Select>
              </FormControl>
            )}
          </form.Field>

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            <form.Field name="startTime" validators={{
              onChange: ({value}) => !value ? "Start time is required" : undefined
            }}>
              {({ state, handleChange, handleBlur }) => (
                <DateTimePicker
                  sx={{ flex: 1, minWidth: '15rem' }}
                  label="Start"
                  value={state.value}
                  onChange={(val) => handleChange(val)}
                  slotProps={{textField: {
                    required: true,
                    error: state.meta.errors.length > 0,
                    helperText: state.meta.errors.join(', '),
                    onBlur: handleBlur
                  }}} />
              )}
            </form.Field>
            <form.Field name="endTime" validators={{
              onChange: ({value}) => !value ? "End time is required" : undefined
            }}>
              {({ state, handleChange, handleBlur }) => (
                <DateTimePicker
                  sx={{ flex: 1, minWidth: '15rem' }}
                  label="End"
                  value={state.value}
                  onChange={(val) => handleChange(val)}
                  slotProps={{textField: {
                    required: true,
                    error: state.meta.errors.length > 0,
                    helperText: state.meta.errors.join(', '),
                    onBlur: handleBlur
                  }}} />
              )}
            </form.Field>
          </Box>

          <form.Field name="timezone" validators={{
            onChange: ({value}) => !value ? "Timezone is required" : undefined
          }}>
            {({ state, handleChange, handleBlur }) => (
              <TextField
                fullWidth
                sx={{ mt: 3 }}
                required
                label="Timezone"
                error={state.meta.errors.length > 0}
                helperText={state.meta.errors.length > 0 ? state.meta.errors.join(', ') : (
                  pcTimezone
                    ? `Your device's current timezone is ${pcTimezone}. Times shown above are in your local timezone, not the event's.`
                    : null
                  )}
                value={state.value ?? ""}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur} />
            )}
          </form.Field>

          {truckRoutesQuery.isPending ? <Loading justifyContent="left" text="Loading routes..." /> : 
            <form.Field name="truckRouteId">
              {({ state, handleChange, handleBlur }) => (
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <InputLabel id="truckRouteLabel">Truck Route</InputLabel>
                  <Select
                    labelId="truckRouteLabel"
                    value={state.value ? state.value : ""}
                    label="Truck Route"
                    onChange={(e) => handleChange(e.target.value as (number | null))}
                    onBlur={handleBlur}
                  >
                    <MenuItem value="">(Unselect route)</MenuItem>
                    {(truckRoutesQuery.data ?? []).map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </form.Field>
          }

          <Box sx={{ mt: 2 }}>
            <form.Subscribe selector={(state) => ([ state.canSubmit, state.isSubmitting, state.isDirty ])}>
              {([ canSubmit, isSubmitting, isDirty ]) => (
                isSubmitting
                  ? <LoadingButton loading />
                  : <Button
                      variant="contained"
                      type="submit" 
                      disabled={!canSubmit || !isDirty}>
                        Save
                    </Button>
              )}
            </form.Subscribe>
          </Box>
        </Box>
      </LocalizationProvider>
    </form>
  </>);
}

export default EventsManageEventInfo;