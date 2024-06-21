import { Button, Box, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TruckRoute, getTruckRoutes } from "../../data/supabase/truckRoutes";
import { useSupaQuery } from "src/hooks/useSupaQuery";

function RouteManageButton({ route }: { route: TruckRoute }) {
  return (
    <Button component={Link} to={`${route.id}`}>Manage</Button>
  )
}

const tableColumns: GridColDef<TruckRoute[][number]>[] = [
  { field: 'name', headerName: 'Name', minWidth: 300, flex: 1 },
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
  const query = useSupaQuery({
    queryKey: ['truckRoutes'],
    queryFn: async (client) => await getTruckRoutes(client)
  });

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