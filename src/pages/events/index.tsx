import { Routes, Route } from "react-router-dom";
import EventsList from "./list";
import EventsManage from "./manage";
import { Typography } from "@mui/material";

function Events() {
  return (
    <>
      <Typography variant="h3" sx={{ mb: 3 }}>Events</Typography>

      <Routes>
        <Route index path="/" element={<EventsList />} />
        <Route path="/:id" element={<EventsManage />} />
      </Routes>
    </>
  )
}

export default Events;