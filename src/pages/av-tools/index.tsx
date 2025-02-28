import { Tab, Tabs, Typography } from "@mui/material";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useRouteMatch } from "src/shared/util.ts";
import EventMatchVideoStats from "src/pages/av-tools/match-video-stats.tsx";

const routes = [{
  path: "/match-video-stats",
  label: "Match Video Stats",
  element: (<EventMatchVideoStats />)
}];

function AvTools() {
  const match = useRouteMatch(routes.map(r => r.path));
  
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>AV Tools</Typography>

      <Tabs value={match} sx={{ mb: 2 }}>
        {routes.map(r => <Tab key={r.path} value={r.path} label={r.label} component={Link} to={`..${r.path}`} /> )}
      </Tabs>

      <Routes>
        <Route index path="/" element={<Navigate to="./match-video-stats" />} />
        {routes.map(r => <Route path={r.path} element={r.element} />)}
      </Routes>
    </>
  )
}

export default AvTools;