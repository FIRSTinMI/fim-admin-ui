import { useGetEquipmentTypes } from "src/data/supabase/equipment.ts";
import { Loading } from "src/shared/Loading.tsx";
import { Alert, Tab, Tabs } from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";
import AvEquipmentTable from "src/pages/equipment/list/av-table.tsx";
import { useTitle } from "src/hooks/useTitle.ts";
import EquipmentLogViewer from "src/shared/EquipmentLogViewer";

const searchParamsWithNewValue = (
  search: URLSearchParams,
  key: string,
  newValue: string
) => {
  const newSearch = new URLSearchParams(search);
  newSearch.set(key, newValue);
  console.log(newSearch);
  return newSearch;
};

const EquipmentList = () => {
  const types = useGetEquipmentTypes();
  const [search, _] = useSearchParams();
  useTitle("Equipment");

  if (types.isLoading) return <Loading />;
  if (types.isError)
    return <Alert severity="error">{types.error!.toString()}</Alert>;
  if (!types.data) return <>idk</>;

  const typeId = search.get("typeId");
  return (
    <div>
      <Tabs value={typeId} sx={{ mb: 2 }}>
        {types.data.map((t) => (
          <Tab
            value={t.id.toString()}
            label={t.name}
            component={Link}
            to={{
              search: searchParamsWithNewValue(
                search,
                "typeId",
                t.id.toString()
              ).toString(),
            }}
          />
        ))}
        <Tab
          value="overall_logs"
          label="Overall Logs"
          component={Link}
          to={{
            search: searchParamsWithNewValue(
              search,
              "typeId",
              "overall_logs"
            ).toString(),
          }}
        />
      </Tabs>

      {/* TODO: This id is hardcoded, but we need a way to differentiate the types because the tables will be different */}
      {typeId === "1" && <AvEquipmentTable />}
      {typeId === null && (
        <p>Select a type of equipment above to view and manage</p>
      )}
      {typeId !== null && !["1", "overall_logs"].includes(typeId) && (
        <Alert severity="info">
          Management of this equipment type is not yet supported
        </Alert>
      )}

      {/* Overall Log Viewer */}
      {typeId === "overall_logs" && <EquipmentLogViewer equipment_id="*" showDevice defaultSeverities={['Error']} />}
    </div>
  );
};

export default EquipmentList;
