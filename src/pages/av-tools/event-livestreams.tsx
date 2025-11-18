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
} from "@mui/material";
import { isWithinInterval } from "date-fns";
import { useState } from "react";
import { useRunEventStreamSetter } from "src/data/admin-api/event-streams";
import { useGetEventsForSeason } from "src/data/supabase/events";
import { useGetSeasons } from "src/data/supabase/seasons";

const EventLivestreams = () => {
  const seasons = useGetSeasons();
  const [seasonId, setSeasonId] = useState<number | undefined>(
    seasons.data?.[seasons.data?.length - 1]?.id
  );
  const events = useGetEventsForSeason(seasonId ?? -1);
  const filteredEvents = (events.data ?? []).filter(
    (ev) =>
      ev.truck_routes &&
      isWithinInterval(new Date(), {
        start: ev.start_time,
        end: ev.end_time,
      })
  );

  const setEvents = useRunEventStreamSetter();

  const runSetEvents = () => {
    setEvents.mutate({
      eventIds: filteredEvents.map((ev) => ev.id),
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
                {(events.data ?? []).length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No events for this season" />
                  </ListItem>
                ) : (
                  filteredEvents.map((ev: any) => (
                    <ListItem key={ev.id} divider>
                      <ListItemText
                        primary={ev.name}
                        secondary={
                          (ev.start_time
                            ? new Date(ev.start_time).toLocaleString()
                            : "") +
                          (ev.location ? ` — ${ev.location}` : "") +
                          (ev.truck_routes ? ` — ${ev.truck_routes.name}` : "")
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </>
          )}

          <Button
            variant="contained"
            loading={setEvents.isPending}
            onClick={runSetEvents}
          >
            Set Livestreams for Current, Routed Events
          </Button>
        </>
      )}
    </>
  );
};

export default EventLivestreams;
