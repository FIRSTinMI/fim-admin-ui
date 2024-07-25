import { Link, Navigate, Route, Routes, matchPath, resolvePath, useLocation } from "react-router-dom";
import EventsManageEventInfo from "./event-info";
import { Tab, Tabs } from "@mui/material";
import EventsManageOverview from "./overview";

const routes = [{
  path: "/overview",
  label: "Overview",
  element: (<EventsManageOverview />)
}, {
  path: "/event-info",
  label: "Edit Info",
  element: (<EventsManageEventInfo />)
}, {
  path: "/teams",
  label: "Teams",
  element: (<p>Not yet implemented.</p>)
}, {
  path: "/staff",
  label: "Staff",
  element: (<p>Not yet implemented.</p>)
}]

function useRouteMatch(patterns: readonly string[]) {
  const { pathname } = useLocation();

  for (let i = 0; i < patterns.length; i += 1) {
    const pattern = patterns[i];
    const resolvedPath = resolvePath(`..${pattern}`, pathname);
    const possibleMatch = matchPath(resolvedPath.pathname, pathname);
    if (possibleMatch !== null) {
      return pattern;
    }
  }

  return null;  
}

function EventsManage() {
  const match = useRouteMatch(routes.map(r => r.path));

  return (<>
    <Tabs value={match ?? routes[0].path} sx={{ mb: 2 }}>
      {routes.map(route => (<Tab key={route.path} value={route.path} label={route.label} component={Link} to={`.${route.path}`} />))}
    </Tabs>
    <Routes>
      {routes.map(route => (<Route key={route.path} index={route.path === "/"} element={route.element} path={route.path} />))}
      <Route index path="/" element={<Navigate to={`.${routes[0].path}`} replace />} />
    </Routes>
    </>);
}

export default EventsManage;