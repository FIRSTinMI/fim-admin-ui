import { Routes } from "react-router-dom";
import { Typography } from "@mui/material";

function AlertRoutes() {
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