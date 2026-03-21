import { Routes, Route } from "react-router-dom";
import { Typography } from "@mui/material";
import { useTitle } from "src/hooks/useTitle.ts";
import SponsorsList from "src/pages/sponsors/list.tsx";

function SponsorsRoutes() {
  useTitle("Sponsors");
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>Sponsors</Typography>

      <Routes>
        <Route index path="/" element={<SponsorsList />} />
      </Routes>
    </>
  )
}

export default SponsorsRoutes;