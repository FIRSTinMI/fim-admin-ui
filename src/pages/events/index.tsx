import { Routes, Route, Navigate } from "react-router-dom";
import EventsList from "./list";
import EventsManage from "./manage";
import EventsCreate from "./create";
import { Typography } from "@mui/material";
import { useTitle } from "src/hooks/useTitle.ts";

function Events() {
  useTitle("Events");
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>Events</Typography>

      <Routes>
        <Route index path="/" element={<EventsList />} />
        <Route path="/create" element={<EventsCreate />} />
        <Route path="/:id">
          <Route path="" element={<Navigate to={"./overview"} replace />} />
          <Route path="*" element={<EventsManage />} />
        </Route>
      </Routes>
    </>
  )
}

export default Events;