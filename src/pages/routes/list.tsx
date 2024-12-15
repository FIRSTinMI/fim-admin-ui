import { Button, Box, CircularProgress, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TruckRoute, useGetTruckRoutes } from "../../data/supabase/truckRoutes";

function RouteManageButton({ route }: { route: TruckRoute }) {
  return (
    <Button component={RouterLink} to={`${route.id}`}>Manage</Button>
  )
}

const tableColumns: GridColDef<TruckRoute[][number]>[] = [
  { field: 'name', headerName: 'Name', minWidth: 300, flex: 1, renderCell: (params) => (
      <Link component={RouterLink} to={`/routes/${params.row.id}`}>{params.row.name}</Link>
    )
  },
  { 
    field: 'actions',
    sortable: false,
    filterable: false,
    hideable: false,
    headerName: 'Actions',
    renderCell: (params) => (<RouteManageButton route={params.row} />)
  }
];

function TruckRoutesList() {
  const query = useGetTruckRoutes();

  return (
    <>
      {query.isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <CircularProgress sx={{ mr: 2 }} /> Loading...
      </Box>}

      {query.isFetched && <DataGrid
        autoHeight
        columns={tableColumns}
        rows={query.data}
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

export default TruckRoutesList;