import { AccessTime } from "@mui/icons-material";
import { Box, Button, Card, Collapse, Divider, FormControl, Link, Paper, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { compareDesc, formatDistanceToNow, formatRelative, getYear, isFuture, isPast } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { createEventNote, CreateEventNoteRequest } from "src/data/admin-api/events";
import { EventPermission } from "src/data/eventPermission";
import { eventStatusToShortDescription } from "src/data/eventStatus";
import { GlobalPermission } from "src/data/globalPermission";
import { Event, getEventQueryKey, useGetEvent } from "src/data/supabase/events";
import useHasEventPermission from "src/hooks/useHasEventPermission";
import { useSupaMutation } from "src/hooks/useSupaMutation";
import { Loading } from "src/shared/Loading";
import { FimSupabaseClient } from "src/supabaseContext";

function EventTiming({ event }: { event: Event }) {
  if (isFuture(event.start_time)) {
    return (<>Starts in {formatDistanceToNow(event.start_time)}</>);
  }
  if (isPast(event.end_time)) {
    return (<>Ended {formatDistanceToNow(event.end_time)} ago</>);
  }
  return (<>Ongoing!</>);
}

function CreateEventNote({ event }: { event: Event }) {
  const [showPostButton, setShowPostButton] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const createNoteMutation = useSupaMutation({
    mutationFn: (client: FimSupabaseClient, req: CreateEventNoteRequest) => createEventNote(client, req),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getEventQueryKey(event.id),
        refetchType: 'active'
      });
    }
  });
  const form = useForm({
    defaultValues: {
      content: ''
    },
    onSubmit: async (form) => {
      const value = form.value;
      await createNoteMutation.mutateAsync({
        eventId: event.id,
        content: value.content
      });
      form.formApi.reset();
    }
  });

  useEffect(() => {
    form.store.subscribe(() => {
      setShowPostButton(form.store.state.isTouched);
    })
  }, [form.store])

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}>
      <FormControl fullWidth>
        <form.Field name="content">{
          ({ state, handleChange, handleBlur }) => (
            // <RichTextEditor />
            <TextField multiline label="Add Note" sx={{ width: '100%' }}
              value={state.value ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
            />
          )}
        </form.Field>
      </FormControl>
      <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Collapse in={showPostButton}>
          {createNoteMutation.isPending
              ? <Button loading />
              : <Button variant="contained" type="submit">Post</Button>}
        </Collapse>
      </Box>
    </form>
  )
}

function EventsManageOverview() {
  const { id } = useParams();
  const eventQuery = useGetEvent(id);
  const canAddNote = useHasEventPermission(id!, [GlobalPermission.Events_Note], [EventPermission.Event_Note]);
  
  const frcEventsUrl = useMemo(() => {
    if (!eventQuery.data?.code || eventQuery.data?.seasons.levels.name !== 'FRC') return null;
    const normalizedCode = eventQuery.data.code.match(/\d*(\w*)/);
    if (!normalizedCode || !normalizedCode[1]) return null;
    return `https://frc-events.firstinspires.org/${getYear(eventQuery.data.start_time)}/${normalizedCode[1]}`;
  }, [eventQuery.data]);

  const tbaUrl = useMemo(() => {
    if (!eventQuery.data?.code || eventQuery.data?.seasons.levels.name !== 'FRC') return null;
    const normalizedCode = eventQuery.data.code.match(/\d*(\w*)/);
    if (!normalizedCode || !normalizedCode[1]) return null;
    return `https://thebluealliance.com/event/${getYear(eventQuery.data.start_time)}${normalizedCode[1].toLowerCase()}`;
  }, [eventQuery.data]);

  const ftcEventsUrl = useMemo(() => {
    if (!eventQuery.data?.code || eventQuery.data?.seasons.levels.name !== 'FTC') return null;
    if (eventQuery.data.sync_source !== 'FtcEvents') return null;
    return `https://ftc-events.firstinspires.org/${getYear(eventQuery.data.start_time)}/${eventQuery.data.code}`;
  }, [eventQuery.data]);
  
  const toaUrl = useMemo(() => {
    if (!eventQuery.data?.code || eventQuery.data.seasons.levels.name !== 'FTC') return null;
    if (eventQuery.data.sync_source === 'FtcEvents') {
      const season = `${eventQuery.data.seasons.start_time.getFullYear() % 100}${eventQuery.data.seasons.end_time.getFullYear() % 100}`
      return `https://theorangealliance.org/events/first-code/${season}/${eventQuery.data.code}`;
    } else if (eventQuery.data.sync_source === 'OrangeAlliance') {
      return `https://theorangealliance.org/events/${eventQuery.data.code}`;
    } else {
      return null;
    }
  }, [eventQuery.data]);
  
  const links = useMemo(() => {
    const ret = [];
    if (frcEventsUrl) ret.push({name: 'FRC Events', url: frcEventsUrl});
    if (tbaUrl) ret.push({name: 'The Blue Alliance', url: tbaUrl});
    if (ftcEventsUrl) ret.push({name: 'FTC Events', url: ftcEventsUrl});
    if (toaUrl) ret.push({name: 'The Orange Alliance', url: toaUrl});
    
    return ret;
  }, [frcEventsUrl, tbaUrl, ftcEventsUrl, toaUrl]);

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
              <Typography variant="h5">{eventStatusToShortDescription(event.status)}</Typography>
              Status
            </Card>
            <RouterLink to={`/routes/${event.truck_routes?.id}`} style={{ textDecoration: 'unset' }}>
              <Card sx={{ p: 1, textAlign: 'center', minWidth: '15em' }} elevation={6}>
                <Typography variant="h5">{event.truck_routes?.name ?? "(N/A)"}</Typography>
                Truck Route
              </Card>
            </RouterLink>
            <Card sx={{ p: 1, textAlign: 'center', minWidth: '15em' }} elevation={6}>
              <Typography variant="h5">{event.code ?? "(N/A)"}</Typography>
              Event Code
            </Card>
          </Box>
          <Divider />
          {links.length > 0 && (<>
            <Box sx={{ m: 2 }}>
              <Typography variant="h4">Links</Typography>
              <Box sx={{display: 'flex', gap: 2}}>
              {links.map((v, i) => <Link key={i} component={RouterLink} to={v.url} target="_blank">{v.name}</Link>)}
              </Box>
            </Box>
            <Divider />
          </>)}
          <Typography variant="h5" sx={{ pt: 2 }}>Notes</Typography>
          <Typography variant="body1" sx={{ pb: 2 }}><em>These notes are visible to anyone who is involved with the event, do not share anything sensitive here.</em></Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {canAddNote && (
              <Card sx={{ width: '100%', p: 2 }} elevation={4}>
                <CreateEventNote event={event} />
              </Card>
            )}
            {event.event_notes?.sort((a, b) => compareDesc(a.created_at, b.created_at)).map(n => (
              <Card sx={{ width: '100%', p: 2 }} elevation={4} key={n.id}>
                <Typography sx={{ pb: 2, whiteSpace: 'pre-wrap', hyphens: 'auto' }}>{n.content}</Typography>
                <Typography variant="body1" display="flex" flexWrap="wrap" alignItems="center" justifyContent="flex-end" gap={1}>
                  {/* <Box display="flex" alignItems="center" gap={0.5}><Person fontSize="inherit" titleAccess="Added by" /> <span>(Unknown user)</span></Box> */}
                  <Box component="span" display="flex" alignItems="center" gap={0.5}><AccessTime fontSize="inherit" titleAccess="Added at" />{formatRelative(n.created_at, new Date())}</Box>
                </Typography>
              </Card>
            ))}
            {(!event.event_notes || event.event_notes?.length === 0) &&
              <Card sx={{ width: '100%', p: 2 }} elevation={4}>
                <Typography sx={{ pb: 2, textAlign: 'center', fontStyle: 'italic' }}>No notes have been created for this event yet</Typography>
              </Card>
            }
          </Box>
        </>);
      })()}
    </>}
  </Paper>);
}

export default EventsManageOverview;