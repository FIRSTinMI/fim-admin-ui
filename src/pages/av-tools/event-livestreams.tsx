import { Delete, Refresh, YouTube } from "@mui/icons-material";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  ListItemIcon,
  Box,
} from "@mui/material";
import { Fragment, useMemo, useState } from "react";
import { useLivestreamDelete, useRunEventStreamSetter } from "src/data/admin-api/event-streams";
import {
  EventStream,
  useGetEventStreamsFromEventIds,
} from "src/data/supabase/av-tools";
import { useGetEventsForSeason } from "src/data/supabase/events";
import { useGetSeasons } from "src/data/supabase/seasons";

const EventLivestreams = () => {
  // Seasons
  const seasons = useGetSeasons();

  // Track Selected Season
  const [seasonId, setSeasonId] = useState<number | undefined>(
    seasons.data?.[seasons.data?.length - 1]?.id
  );

  // Track loading state for single event updates
  const [singleLoading, setSingleLoading] = useState<string>("");
  const [singleDelete, setSingleDelete] = useState<string>("");

  // Events for Season
  const events = useGetEventsForSeason(seasonId ?? -1);

  // Filter to events with routes that are current or upcoming
  const filteredEvents = useMemo(
    () =>
      (events.data ?? []).filter(
        (ev) =>
          ev.truck_routes &&
          (ev.start_time >= new Date() || ev.end_time >= new Date())
      ),
    [events.data]
  );

  // Get existing streams for these events
  const eventStreams = useGetEventStreamsFromEventIds(
    filteredEvents.map((ev) => ev.id)
  );

  // Map of eventId to streams
  const streamMap = useMemo(() => {
    const map: { [eventId: string]: EventStream[] } = {};
    if (eventStreams.data) {
      for (const stream of eventStreams.data) {
        if (!map[stream.event_id]) map[stream.event_id] = [];
        map[stream.event_id].push(stream);
      }
    }
    console.log(map);
    return map;
  }, [eventStreams.data]);

  const setEvents = useRunEventStreamSetter();
  const deleteStream = useLivestreamDelete();

  const runSetEvents = () => {
    setEvents.mutateAsync({
      eventIds: filteredEvents.map((ev) => ev.id),
    }).finally(() => {
      eventStreams.refetch();
    });
  };

  const runSingleEvent = (eventId: string) => {
    setSingleLoading(eventId);
    setEvents
      .mutateAsync({
        eventIds: [eventId],
      })
      .finally(() => {
        eventStreams.refetch();
        setSingleLoading("");
      });
  };

  const runDeleteStream = (livestreamId: string) => {
    setSingleDelete(livestreamId.toString());
    deleteStream
      .mutateAsync({
        livestreamId,
      })
      .finally(() => {
        eventStreams.refetch();
        setSingleDelete("");
      });
  };

  return (
    <>
      {!seasons.isPending && (
        <>
          <FormControl fullWidth>
            <InputLabel id="seasonLabel">Season</InputLabel>
            <Select
              labelId="seasonLabel"
              value={
                seasons.data?.some((s) => s.id == seasonId) ? seasonId : ""
              }
              label="Season"
              onChange={(e) =>
                setSeasonId(e.target.value as number | undefined)
              }
            >
              {(seasons.data ?? []).map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.levels.name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Current Events with Routes
          </Typography>

          {!events.isPending && (
            <>
              <List>
                {filteredEvents.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No events for this season" />
                  </ListItem>
                ) : (
                  filteredEvents.map((ev: any) => (
                    <Fragment key={ev.id}>
                      <ListItem
                        divider
                        secondaryAction={
                          <Tooltip title="Update or Create Livestream">
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => runSingleEvent(ev.id)}
                              disabled={singleLoading === ev.id}
                            >
                              {singleLoading === ev.id ? (
                                <CircularProgress size={24} />
                              ) : (
                                <Refresh />
                              )}
                            </IconButton>
                          </Tooltip>
                        }
                      >
                        <ListItemText
                          primary={ev.name}
                          secondary={
                            (ev.start_time
                              ? new Date(ev.start_time).toLocaleString()
                              : "") +
                            (ev.location ? ` — ${ev.location}` : "") +
                            (ev.truck_routes
                              ? ` — ${ev.truck_routes.name}`
                              : "") +
                            (ev.truck_routes?.streaming_config?.Channel_Type
                              ? ` (${ev.truck_routes.streaming_config.Channel_Type} - ${ev.truck_routes.streaming_config.Channel_Id})`
                              : "")
                          }
                        />
                      </ListItem>

                      {streamMap[ev.id] && streamMap[ev.id].length > 0 && (
                        <List sx={{ pl: 4 }}>
                          {streamMap[ev.id].map((stream) => (
                            <ListItem 
                              key={stream.id}                              
                              secondaryAction={
                                <Tooltip title="Delete Livestream">
                                  <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => runDeleteStream(stream.id)}
                                    disabled={singleDelete === stream.id.toString()}
                                    sx={{mr: 10}}
                                  >
                                    {singleDelete === stream.id.toString() ? (
                                      <CircularProgress size={24} />
                                    ) : (
                                      <Delete />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              }
                            >
                              <ListItemIcon>
                                {stream.platform.toLowerCase() === "twitch" ? (
                                  <img
                                    src="https://pngimg.com/d/twitch_PNG48.png"
                                    alt="Twitch"
                                    style={{ width: 24, height: 24 }}
                                  />
                                ) : (
                                  <YouTube />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={stream.title}
                                secondary={`${stream.platform} - ${stream.url}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}

                      <Divider />
                    </Fragment>
                  ))
                )}
              </List>
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              loading={setEvents.isPending}
              onClick={runSetEvents}
            >
              Set Livestreams for All Routed Events
            </Button>
          </Box>
        </>
      )}
    </>
  );
};

export default EventLivestreams;
