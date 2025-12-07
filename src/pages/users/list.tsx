import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FormControl, Button, TextField, InputAdornment, Box, CircularProgress, Alert } from "@mui/material";
import { Search } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { User, getUsers } from "src/data/admin-api/users";
import { useSupaQuery } from "src/hooks/useSupaQuery";

function formatPermissions(permissions: string[]) {
  if (permissions.length > 2) return `(${permissions.length} permissions)`;
  return permissions.join(', ');
}

function UserManageButton({ user }: { user: User }) {
  return (
    <Button component={Link} to={`${user.id}`}>Manage</Button>
  )
}

const tableColumns: GridColDef<User[][number]>[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  {
    field: 'globalPermissions',
    headerName: 'Permissions',
    width: 300,
    flex: 1,
    renderCell: (params) => formatPermissions(params.value)
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
  const [search, setSearch] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const query = useSupaQuery({
    queryKey: ['users', search],
    queryFn: async (client) => await getUsers(client, search)
  });

  const handleSearch = useCallback(() => {
    setSearch(inputValue)
  }, [inputValue]);

  return (
    <>
      <form onSubmit={(e) => {e.preventDefault(); handleSearch()}}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="Search"
            onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
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
      
      {query.isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <CircularProgress sx={{ mr: 2 }} /> Loading...
      </Box>}

      {query.isError && <Alert severity="error">
          Unable to get user information.
        </Alert>}

      {query.isSuccess && <Box sx={{display: 'flex'}}><DataGrid
        columns={tableColumns}
        rows={query.data}
        hideFooter={true}
        initialState={{
          sorting: {
            sortModel: [{
              field: 'email',
              sort: 'asc'
            }]
          }
        }}
      /></Box>}
    </>
  );
}

export default UsersList;