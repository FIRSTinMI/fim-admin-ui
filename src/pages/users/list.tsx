import { Effect } from "effect";
import { useState, useContext, useEffect, useCallback } from "react";
import { SupabaseContext } from "../../supabaseContext";
import { FormControl, Button, TextField, InputAdornment, Box, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { RemoteData, Loading, isLoading, getData } from "../../shared/RemoteData";
import { User, getUsers } from "../../data/admin-api";
import { Search } from "@mui/icons-material";

function UserManageButton({ user }: { user: User }) {
  return (
    <Button component={Link} to={`${user.id}`}>Manage</Button>
  )
}

const tableColumns: GridColDef<User[][number]>[] = [
  { field: 'name', headerName: 'Name', minWidth: 300, flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  {
    field: 'globalRoles',
    headerName: 'Roles',
    width: 300,
    flex: 1,
    renderCell: (params) => (params.row.globalRoles.join(', '))
  },
  { 
    field: 'actions',
    sortable: false,
    filterable: false,
    hideable: false,
    headerName: 'Actions',
    renderCell: (params) => (<UserManageButton user={params.row} />)
  }
];

function UsersList() {
  const supabase = useContext(SupabaseContext);
  const [search, setSearch] = useState<string>("");
  const [users, setUsers] = useState<RemoteData<User[]>>(Loading());

  useEffect(() => {
    setUsers(Loading());
    (async () => {
      setUsers(await Effect.runPromise(getUsers("", (await supabase.auth.getSession()).data.session?.access_token ?? '')));
    })();
  }, [supabase.auth]);

  const handleSearch = useCallback(() => {
    setUsers(Loading());
    (async () => {
      setUsers(await Effect.runPromise(getUsers(search, (await supabase.auth.getSession()).data.session?.access_token ?? '')));
    })();
  }, [search, supabase.auth]);

  return (
    <>
      <form onSubmit={(e) => {e.preventDefault(); handleSearch()}}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="Search"
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </FormControl>
      </form>
      {isLoading(users) && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <CircularProgress sx={{ mr: 2 }} /> Loading...
      </Box>}

      {!isLoading(users) && <DataGrid
        autoHeight
        columns={tableColumns}
        rows={getData(users)}
        initialState={{
          sorting: {
            sortModel: [{
              field: 'email',
              sort: 'asc'
            }]
          }
        }}
       />}
    </>
  );
}

export default UsersList;