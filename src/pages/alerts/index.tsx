import { Routes } from "react-router-dom";
import { Typography } from "@mui/material";
import { useTitle } from "src/hooks/useTitle.ts";

function AlertRoutes() {
  useTitle("Alerts");
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>Alerts</Typography>

      <Routes>
        {/*<Route index path="/" element={<TruckRoutesList />} />*/}
      </Routes>
    </>
  )
}

export default AlertRoutes;