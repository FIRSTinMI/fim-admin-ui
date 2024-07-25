import { LoadingButton } from "@mui/lab";
import { Box, Button, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetEventQuery } from "src/data/supabase/events";
import { getTruckRoutes } from "src/data/supabase/truckRoutes";
import { useSupaQuery } from "src/hooks/useSupaQuery";
import { Loading } from "src/shared/Loading";

function EventsManageEventInfo() {
  const { id } = useParams();
  const eventQuery = useGetEventQuery(id!, false);
  const truckRoutesQuery = useSupaQuery({
    queryKey: ['truckRoutes'],
    queryFn: (client) => getTruckRoutes(client).then(async resp => {
      await new Promise((res) => setTimeout(res, 1000));
      return resp;
    })
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
    onSubmit: (props) => {
      console.log(props);
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
        timezone: data.timezone,
        status: data.status
      }
    });
  }, [eventQuery, form])

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
          <form.Field name="name">
            {({ state, handleChange, handleBlur }) => (
              <TextField
                fullWidth
                label="Name"
                value={state.value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur} />
            )}
          </form.Field>

          <Box sx={{ display: 'flex', gap: 2, my: 3, flexWrap: 'wrap' }}>
            <form.Field name="startTime">
              {({ state, handleChange, handleBlur }) => (
                <DateTimePicker sx={{ flex: 1, minWidth: '15rem' }} label="Start" value={state.value} onChange={(val) => handleChange(val)} slotProps={{textField: {
                  onBlur: handleBlur
                }}} />
              )}
            </form.Field>
            <form.Field name="endTime">
              {({ state, handleChange, handleBlur }) => (
                <DateTimePicker sx={{ flex: 1, minWidth: '15rem' }} label="End" value={state.value} onChange={(val) => handleChange(val)} slotProps={{textField: {
                  onBlur: handleBlur
                }}} />
              )}
            </form.Field>
          </Box>

          {truckRoutesQuery.isPending ? <Loading justifyContent="left" text="Loading routes..." /> : 
            <form.Field name="truckRouteId">
              {({ state, handleChange, handleBlur }) => (
                <TextField sx={{ flex: 1, minWidth: '15rem' }} label="Truck Route" value={state.value ?? ""} onChange={(e) => handleChange(parseInt(e.target.value, 10))} onBlur={handleBlur} />
              )}
            </form.Field>
          }

          <Box sx={{ mt: 2 }}>
            {form.state.isSubmitting ? <LoadingButton loading /> : <Button variant="contained" type="submit">Save</Button>}
          </Box>
        </Box>
      </LocalizationProvider>
    </form>
  </>);
}

export default EventsManageEventInfo;