import {
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useGetEventMatchVideoStats } from "src/data/supabase/av-tools.ts";
import { Loading } from "src/shared/Loading.tsx";
import { useState } from "react";
import { useGetSeasons } from "src/data/supabase/seasons.ts";
import { useGetEventsForSeason } from "src/data/supabase/events.ts";
import MutationButton from "src/shared/MutationButton.tsx";
import { useRefreshMatchResults } from "src/data/admin-api/events.ts";

function RefreshMatchesButton({eventId}: {eventId: string}) {
  const refreshMatchesMutation = useRefreshMatchResults();

  return (<MutationButton
    mutation={refreshMatchesMutation}
    onClick={() => refreshMatchesMutation.mutateAsync(eventId)}>
    Refresh
  </MutationButton>)
}

function EventMatchVideoStats() {
  const seasons = useGetSeasons();
  const [seasonId, setSeasonId] = useState<number | undefined>(undefined);
  const seasonEvents = useGetEventsForSeason(seasonId ?? null, !!seasonId);
  const stats = useGetEventMatchVideoStats(!seasonId, seasonEvents?.data?.map(e => e.id));

  if (stats.isPending) return <Loading />;
  
  return (
    <>
      {!seasons.isPending && <>
        <FormControl fullWidth>
          <InputLabel id="seasonLabel">Season</InputLabel>
          <Select
            labelId="seasonLabel"
            value={seasons.data?.some(s => s.id == seasonId) ? seasonId : ''}
            label="Season"
            onChange={(e) => setSeasonId(e.target.value as (number | undefined))}
          >
            {(seasons.data ?? []).map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.levels.name})</MenuItem>)}
          </Select>
        </FormControl>
      </>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Event Name</TableCell>
            <TableCell>Quals</TableCell>
            <TableCell>Playoffs</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats.data!.map(stat => (<TableRow key={stat.id}>
            <TableCell>
              <Link component={RouterLink} to={`/events/${stat.id}/overview`}>{stat.name}</Link>{' '}
              ({stat.code})
            </TableCell>
            <TableCell>
              {stat.numQualVideos} / {stat.numQual}
              {(stat.lateQualVideos?.length ?? 0) > 0 ? (
                <>
                  <Typography color="error" component="span"> ({stat.lateQualVideos!.length} late)</Typography>
                  <ul style={{paddingInline: '1em', marginBlock: 0, marginBlockStart: '.3em'}}>
                    {stat.lateQualVideos!.map((v, i) => <li key={i}>{v}</li>)} 
                  </ul>
                </>
              ) : (<></>)}
            </TableCell>
            <TableCell>
              {stat.numPlayoffVideos} / {stat.numPlayoff}
              {(stat.latePlayoffVideos?.length ?? 0) > 0 ? (
                <>
                  <Typography color="error" component="span"> ({stat.latePlayoffVideos!.length} late)</Typography>
                  <ul style={{paddingInline: '1em', marginBlock: 0, marginBlockStart: '.3em'}}>
                    {stat.latePlayoffVideos!.map((v, i) => <li key={i}>{v}</li>)}
                  </ul>
                </>
              ) : (<></>)}
            </TableCell>
            <TableCell>
              <RefreshMatchesButton eventId={stat.id} />
            </TableCell>
          </TableRow>))}
        </TableBody>
      </Table>
    </>
  );
}

export default EventMatchVideoStats;