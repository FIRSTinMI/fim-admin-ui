import { Link, Navigate, Route, Routes, matchPath, resolvePath, useLocation, useParams } from "react-router-dom";
import EventsManageEventInfo from "./event-info";
import { Tab, Tabs } from "@mui/material";
import EventsManageOverview from "./overview";
import { GlobalPermission } from "src/data/globalPermission";
import { EventPermission } from "src/data/eventPermission";
import useHasEventPermission from "src/hooks/useHasEventPermission";
//import EventsManageStaff from "src/pages/events/manage/staff.tsx";
import EventsManageMatches from "src/pages/events/manage/matches.tsx";

const routes = [{
  path: "/overview",
  label: "Overview",
  element: (<EventsManageOverview />)
}, {
  path: "/event-info",
  label: "Edit Info",
  element: (<EventsManageEventInfo />),
  globalPermission: GlobalPermission.Events_Manage,
  eventPermission: EventPermission.Event_ManageInfo
}, {
  path: "/matches",
  label: "Matches",
  element: (<EventsManageMatches />)
}, {
  path: "/teams",
  label: "Teams",
  element: (<p>Not yet implemented.</p>)
}//, {
//   path: "/staff",
//   label: "Staff",
//   element: (<EventsManageStaff />),
//   globalPermission: GlobalPermission.Events_Manage,
//   eventPermission: EventPermission.Event_ManageStaff
// }
];

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

function EventTab({ eventId, path, label, eventPermission, globalPermission }: { value: string, eventId: string, path: string, label: string, eventPermission?: EventPermission, globalPermission?: GlobalPermission }) {
  const hasPermission = useHasEventPermission(eventId, globalPermission ? [globalPermission] : [], eventPermission ? [eventPermission] : []);
  if (hasPermission) {
    return (<Tab label={label} component={Link} to={`.${path}`} />);
  } else {
    return (<></>);
  }
}

function EventsManage() {
  const match = useRouteMatch(routes.map(r => r.path));
  const { id: eventId } = useParams();

  return (<>
    <Tabs value={match ?? routes[0].path} sx={{ mb: 2 }}>
      {routes.map(route => (<EventTab key={route.path} value={route.path}
        eventId={eventId!} path={route.path} label={route.label}
        eventPermission={route.eventPermission} globalPermission={route.globalPermission}
      />))}
    </Tabs>
    <Routes>
      {routes.map(route => (<Route key={route.path} index={route.path === "/"} element={route.element} path={route.path} />))}
      <Route index path="/" element={<Navigate to={`.${routes[0].path}`} replace />} />
    </Routes>
    </>);
}

export default EventsManage;