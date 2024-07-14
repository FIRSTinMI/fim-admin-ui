import { Routes, Route } from "react-router-dom";
import TruckRoutesList from "./list";
import TruckRoutesManage from "./manage";
import { Typography } from "@mui/material";

function TruckRoutes() {
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>Truck Routes</Typography>

      <Routes>
        <Route index path="/" element={<TruckRoutesList />} />
        <Route path="/:id" element={<TruckRoutesManage />} />
      </Routes>
    </>
  )
}

export default TruckRoutes;