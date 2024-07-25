import { AccessTime } from "@mui/icons-material";
import Person from "@mui/icons-material/Person";
import { LoadingButton } from "@mui/lab";
import { Box, Button, Card, Collapse, Divider, FormControl, Paper, TextField, Typography } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { compareDesc, formatDistanceToNow, formatRelative, isFuture, isPast } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { createEventNote, CreateEventNoteRequest } from "src/data/admin-api/events";
import { Event, getEvent } from "src/data/supabase/events";
import { useSupaMutation } from "src/hooks/useSupaMutation";
import { useSupaQuery } from "src/hooks/useSupaQuery";
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

function EventStatus({ event }: { event: Event }) {
  const status = useMemo(() => {
    return event.status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }, [event.status]);
  return (<>{status}</>)
}

function CreateEventNote({ event }: { event: Event }) {
  const [showPostButton, setShowPostButton] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const createNoteMutation = useSupaMutation({
    mutationFn: (client: FimSupabaseClient, req: CreateEventNoteRequest) => createEventNote(client, req),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['events', event.id],
        refetchType: 'active'
      });
    }
  });
  const form = useForm<{ content: string }>({
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
              ? <LoadingButton loading />
              : <Button variant="contained" type="submit">Post</Button>}
        </Collapse>
      </Box>
    </form>
  )
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
            {/* TODO: Lock this behind a permission check */}
            <Card sx={{ width: '100%', p: 2 }} elevation={4}>
              <CreateEventNote event={event} />
            </Card>
            {event.event_notes?.sort((a, b) => compareDesc(a.created_at, b.created_at)).map(n => (
              <Card sx={{ width: '100%', p: 2 }} elevation={4} key={n.id}>
                <Typography sx={{ pb: 2 }}>{n.content}</Typography>
                <Typography variant="body1" display="flex" flexWrap="wrap" alignItems="center" justifyContent="flex-end" gap={1}>
                  {/* <Box display="flex" alignItems="center" gap={0.5}><Person fontSize="inherit" titleAccess="Added by" /> <span>(Unknown user)</span></Box> */}
                  <Box display="flex" alignItems="center" gap={0.5}><AccessTime fontSize="inherit" titleAccess="Added at" />{formatRelative(n.created_at, new Date())}</Box>
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