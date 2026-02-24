import { useSupaQuery } from "src/hooks/useSupaQuery.ts";
import { Equipment } from "src/data/supabase/equipment.ts";
import { AvCartConfiguration, getVmixConfig } from "src/data/admin-api/av-cart-tools.ts";
import { Alert, Box, LinearProgress } from "@mui/material";
import { JsonEditor } from "json-edit-react";

interface IProps {
  hardware: Equipment<AvCartConfiguration>;
}

const VmixConfig = ({ hardware }: IProps) => {
  const configQuery = useSupaQuery({
    queryKey: ["vmixConfig", hardware.id],
    queryFn: (client) => getVmixConfig(client, hardware.id),
    staleTime: 30_000,
  });

  return (
    <div>
      {configQuery.isFetching && <Box sx={{width: '100%'}}><LinearProgress /></Box>}
      {configQuery.isSuccess && (configQuery.data === null
        ? <Alert severity="warning">Unable to fetch config, is vMix running?</Alert>
        : <JsonEditor maxWidth="100%" data={configQuery.data ?? {}} viewOnly collapse={(node) => node.level >= 2} />)}
      {configQuery.isError && <Alert security="error">Error loading config: {configQuery.error!.toString()}</Alert> }
    </div>
  );
};

export default VmixConfig;