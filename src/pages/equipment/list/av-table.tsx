import { useGetEquipmentOfType } from "src/data/supabase/equipment.ts";
import { Loading } from "src/shared/Loading.tsx";
import { Alert, Box, Link } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import { getRelativeTime } from "src/shared/util";
import { AvCartConfiguration } from "src/data/admin-api/av-cart-tools";

const AvEquipmentTable = () => {
  const carts = useGetEquipmentOfType<AvCartConfiguration>(1);
  
  if (carts.isLoading) return <Loading />;
  if (carts.isError) return <Alert severity="error">{carts.error!.toString()}</Alert>;
  if (!carts.data) return <>idk</>;
  
  return (
    <Box sx={{paddingBottom: 5}}>
      <DataGrid hideFooter={true} rows={carts.data} columns={[
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150, renderCell: (params) => (
            <Link component={RouterLink} to={`./${params.row.id}`}>{params.value}</Link>
          ) },
        { field: 'lastSeen', headerName: 'Last Seen', minWidth: 250, valueGetter: (_, row) => getRelativeTime(row.configuration.LastSeen) },
        { field: 'assistantVersion', headerName: 'Assistant Version', minWidth: 250, valueGetter: (_, row) => row.configuration.AssistantVersion }
      ]} />
    </Box>
  );
};

export default AvEquipmentTable;