import { Tab, Tabs, Typography } from "@mui/material";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useRouteMatch } from "src/shared/util.ts";
import EventMatchVideoStats from "src/pages/av-tools/match-video-stats.tsx";
import { useTitle } from "src/hooks/useTitle.ts";
import Twitch from "./twitch";
import EventLivestreams from "./event-livestreams";

const routes = [{
  path: "/match-video-stats",
  label: "Match Video Stats",
  element: (<EventMatchVideoStats />)
},
{
  path: "/twitch",
  label: "Twitch",
  element: (<Twitch />)
},
{
  path: "/event-livestreams",
  label: "Event Livestreams",
  element: (<EventLivestreams />)
}
];

function AvTools() {
  const match = useRouteMatch(routes.map(r => r.path));
  useTitle("AV Tools");
  
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>AV Tools</Typography>

      <Tabs value={match} sx={{ mb: 2 }}>
        {routes.map(r => <Tab key={r.path} value={r.path} label={r.label} component={Link} to={`..${r.path}`} relative="path" /> )}
      </Tabs>

      <Routes>
        <Route index path="/" element={<Navigate to="./match-video-stats" replace />} />
        {routes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
      </Routes>
    </>
  )
}

export default AvTools;
