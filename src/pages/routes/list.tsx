import { Button, Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TruckRoute, useGetTruckRoutes } from "../../data/supabase/truckRoutes";
import { Loading } from "src/shared/Loading.tsx";

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
    <Box>
      {query.isLoading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Loading />
      </Box>}

      {query.isFetched && <DataGrid
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
    </Box>
  );
}

export default TruckRoutesList;