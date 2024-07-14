import { Routes, Route } from "react-router-dom";
import EventsList from "./list";
import EventsManage from "./manage";
import EventsCreate from "./create";
import { Typography } from "@mui/material";

function Events() {
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>Events</Typography>

      <Routes>
        <Route index path="/" element={<EventsList />} />
        <Route path="/create" element={<EventsCreate />} />
        <Route path="/:id/*" element={<EventsManage />} />
      </Routes>
    </>
  )
}

export default Events;