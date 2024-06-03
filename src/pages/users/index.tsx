import { Routes, Route } from "react-router-dom";
import UsersList from "./list";
import UsersManage from "./manage";
import { Typography } from "@mui/material";

function Users() {
  return (
    <>
      <Typography variant="h3" sx={{ mb: 3 }}>Users</Typography>

      <Routes>
        <Route index path="/" element={<UsersList />} />
        <Route path="/:id" element={<UsersManage />} />
      </Routes>
    </>
  )
}

export default Users;