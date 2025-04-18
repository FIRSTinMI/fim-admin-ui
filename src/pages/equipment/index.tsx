import { Routes, Route } from "react-router-dom";
import { Typography } from "@mui/material";
import EquipmentList from "src/pages/equipment/list";
import Equipment from "./equipment";

function EquipmentRoutes() {
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>Equipment</Typography>

      <Routes>
        <Route index path="/" element={<EquipmentList />} />
        <Route index path="/:id/:tab" element={<Equipment />} />
        <Route index path="/:id" element={<Equipment />} />
      </Routes>
    </>
  )
}

export default EquipmentRoutes;