import { useState, useCallback } from "react";
import { FormControl, Button, TextField, InputAdornment, Box, CircularProgress, Alert } from "@mui/material";
import { Link } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { User, getUsers } from "../../data/admin-api";
import { Search } from "@mui/icons-material";
import { useSupaQuery } from "../../useSupaQuery";

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

      {query.isSuccess && <DataGrid
        autoHeight
        columns={tableColumns}
        rows={query.data}
        pageSizeOptions={[20]}
        hideFooterPagination={true}
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