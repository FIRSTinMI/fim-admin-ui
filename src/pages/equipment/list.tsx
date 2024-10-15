import { useGetEquipmentTypes } from "src/data/supabase/equipment.ts";
import { Loading } from "src/shared/Loading.tsx";
import { Alert } from "@mui/material";

const EquipmentList = () => {
  const types = useGetEquipmentTypes();
  
  if (types.isLoading) return <Loading />;
  if (types.isError) return <Alert severity="error">{types.error!.toString()}</Alert>;
  if (!types.data) return <>idk</>;
  
  return (
    <ul>
      { types.data.map(t => <li key={t.id}>{t.name}</li>) }
    </ul>
  );
};

export default EquipmentList;