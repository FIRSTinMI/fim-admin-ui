import { AccessTime } from "@mui/icons-material";
import Person from "@mui/icons-material/Person";
import { Box, Card, Divider, Paper, TextField, Typography } from "@mui/material";
import { formatDistanceToNow, formatRelative, isFuture, isPast } from "date-fns";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Event, getEvent } from "src/data/supabase/events";
import { useSupaQuery } from "src/hooks/useSupaQuery";
import { Loading } from "src/shared/Loading";

function EventTiming({ event }: { event: Event }) {
  if (isFuture(event.start_time)) {
    return (<>Starts in {formatDistanceToNow(event.start_time)}</>);
  }
  if (isPast(event.end_time)) {
    return (<>Ended {formatDistanceToNow(event.end_time)} ago</>);
  }
  return (<>Ongoing!</>);
}

function EventStatus({ event }: { event: Event }) {
  const status = useMemo(() => {
    return event.status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }, [event.status]);
  return (<>{status}</>)
}

function EventsManageOverview() {
  const { id } = useParams();
  const eventQuery = useSupaQuery({
    queryKey: ['events', id!],
    queryFn: (client) => getEvent(client, id!)
  });
  return (<Paper sx={{ width: '100%', p: 2 }}>
    {eventQuery.isPending && <Loading />}
    {eventQuery.isSuccess && <>
      {(() => {
        const event = eventQuery.data;
        return (<>
          <Typography variant="h4" sx={{ pb: 2 }}>{event!.name}</Typography>
          <Box sx={{ display: 'flex', gap: 2, pb: 4, justifyContent: 'space-evenly', flexWrap: 'wrap' }}>
            <Card sx={{ p: 1, textAlign: 'center', minWidth: '15em' }} elevation={6}>
              <Typography variant="h5"><EventTiming event={event} /></Typography>
              Event Timing
            </Card>
            <Card sx={{ p: 1, textAlign: 'center', minWidth: '15em' }} elevation={6}>
              <Typography variant="h5"><EventStatus event={event} /></Typography>
              Status
            </Card>
            <Card sx={{ p: 1, textAlign: 'center', minWidth: '15em' }} elevation={6}>
              <Typography variant="h5">{event.truck_routes?.name ?? "(N/A)"}</Typography>
              Truck Route
            </Card>
            <Card sx={{ p: 1, textAlign: 'center', minWidth: '15em' }} elevation={6}>
              <Typography variant="h5">{event.code ?? "(N/A)"}</Typography>
              Event Code
            </Card>
          </Box>
          <Divider />
          <Typography variant="h5" sx={{ pt: 2 }}>Notes</Typography>
          <Typography variant="body1" sx={{ pb: 2 }}><em>These notes are visible to anyone who is involved with the event, do not share anything sensitive here.</em></Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Card sx={{ width: '100%', p: 2 }} elevation={4}>
              <TextField multiline label="Add Note" sx={{ width: '100%' }} />
            </Card>
            <Card sx={{ width: '100%', p: 2 }} elevation={4}>
              <Typography sx={{ pb: 2 }}>This is a test note</Typography>
              <Typography variant="body1" display="flex" flexWrap="wrap" alignItems="center" justifyContent="flex-end" gap={1}>
                <Box display="flex" alignItems="center" gap={0.5}><Person fontSize="inherit" titleAccess="Added by" /> <span>Evan Lihou</span></Box>
                <Box display="flex" alignItems="center" gap={0.5}><AccessTime fontSize="inherit" titleAccess="Added at" />{formatRelative(new Date("2024-06-22"), new Date())}</Box>
              </Typography>
            </Card>
            <Card sx={{ width: '100%', p: 2 }} elevation={4}>
              <Typography sx={{ pb: 2 }}>Oh hey look, another note</Typography>
              <Typography variant="body1" display="flex" flexWrap="wrap" alignItems="center" justifyContent="flex-end" gap={1}>
                <Box display="flex" alignItems="center" gap={0.5}><Person fontSize="inherit" titleAccess="Added by" /> <span>Evan Lihou</span></Box>
                <Box display="flex" alignItems="center" gap={0.5}><AccessTime fontSize="inherit" titleAccess="Added at" />{formatRelative(new Date("2024-06-22"), new Date())}</Box>
              </Typography>
            </Card>
          </Box>
        </>);
      })()}
    </>}
  </Paper>);
}

export default EventsManageOverview;