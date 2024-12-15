import { Routes, Route } from "react-router-dom";
import { Alert, Typography } from "@mui/material";
import EquipmentList from "src/pages/equipment/list";

function EquipmentRoutes() {
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>Equipment</Typography>

      <Routes>
        <Route index path="/" element={<EquipmentList />} />
        <Route index path="/:id" element={<Alert severity="error">Not yet implemented</Alert>} />
      </Routes>
    </>
  )
}

export default EquipmentRoutes;