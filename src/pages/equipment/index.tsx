import { Routes, Route } from "react-router-dom";
import { Typography } from "@mui/material";
import EquipmentList from "src/pages/equipment/list.tsx";

function EquipmentRoutes() {
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>Equipment</Typography>

      <Routes>
        <Route index path="/" element={<EquipmentList />} />
      </Routes>
    </>
  )
}

export default EquipmentRoutes;