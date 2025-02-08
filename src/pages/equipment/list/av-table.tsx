import { useGetEquipmentOfType } from "src/data/supabase/equipment.ts";
import { Loading } from "src/shared/Loading.tsx";
import { Alert, Link } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

type AvCartConfiguration = {
  LastSeen: string | null,
  AuthToken: string,
  AssistantVersion: string,
  StreamInfo: {
    Index: number,
    CartId: string,
    Enabled: boolean,
    RtmpKey: string,
    RtmpUrl: string
  }[]
};

const getRelativeTime = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  if (value === "infinity") {
    return "Now";
  }
  
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

const AvEquipmentTable = () => {
  const carts = useGetEquipmentOfType<AvCartConfiguration>(1);
  
  if (carts.isLoading) return <Loading />;
  if (carts.isError) return <Alert severity="error">{carts.error!.toString()}</Alert>;
  if (!carts.data) return <>idk</>;
  
  return (
    <div>
      <DataGrid rows={carts.data} columns={[
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150, renderCell: (params) => (
            <Link component={RouterLink} to={`./${params.row.id}`}>{params.value}</Link>
          ) },
        { field: 'lastSeen', headerName: 'Last Seen', minWidth: 250, valueGetter: (_, row) => getRelativeTime(row.configuration.LastSeen) },
        { field: 'assistantVersion', headerName: 'Assistant Version', minWidth: 250, valueGetter: (_, row) => row.configuration.AssistantVersion }
      ]} />
    </div>
  );
};

export default AvEquipmentTable;