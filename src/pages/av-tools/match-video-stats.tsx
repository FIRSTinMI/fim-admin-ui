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
        {stats.data!.map(stat => (<TableRow>
          <TableCell><Link component={RouterLink} to={`/events/${stat.id}/overview`}>{stat.name}</Link></TableCell>
          <TableCell>
            {stat.num_qual_videos} / {stat.num_qual}
            {stat.num_late_qual_videos > 0 ? (<Typography color="error" component="span"> ({stat.num_late_qual_videos} late)</Typography>) : (<></>)}
          </TableCell>
          <TableCell>
            {stat.num_playoff_videos} / {stat.num_playoff}
            {stat.num_late_playoff_videos > 0 ? (<Typography color="error" component="span">({stat.num_late_playoff_videos} late)</Typography>) : (<></>)}
          </TableCell>
        </TableRow>))}
      </TableBody>
    </Table>
  );
}

export default EventMatchVideoStats;