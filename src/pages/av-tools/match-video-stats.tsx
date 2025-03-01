import { Link, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useGetEventMatchVideoStats } from "src/data/supabase/av-tools.ts";
import { Loading } from "src/shared/Loading.tsx";

function EventMatchVideoStats() {
  const stats = useGetEventMatchVideoStats();
  
  if (stats.isPending) return <Loading />;
  
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Event Name</TableCell>
          <TableCell>Quals</TableCell>
          <TableCell>Playoffs</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {stats.data!.map(stat => (<TableRow key={stat.id}>
          <TableCell><Link component={RouterLink} to={`/events/${stat.id}/overview`}>{stat.name}</Link></TableCell>
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
        </TableRow>))}
      </TableBody>
    </Table>
  );
}

export default EventMatchVideoStats;