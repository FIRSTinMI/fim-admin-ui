import { Match, TournamentLevel, useGetMatchesForEvent } from "src/data/supabase/matches.ts";
import { useParams } from "react-router-dom";
import { Loading } from "src/shared/Loading.tsx";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridComparatorFn, GridFilterModel,
  gridNumberComparator,
  useGridApiRef
} from "@mui/x-data-grid";
import format from "date-fns/format";
import { Alert, Box, Button } from "@mui/material";
import { JSXElementConstructor, useMemo, useState } from "react";
import { Delete } from "@mui/icons-material";
import DataTableFilterToolbar from "src/shared/DataTableFilterToolbar.tsx";

const formatDate = (date: Date | null) => {
  if (date === null) return "";
  
  return format(date, "EEE p")
};

type MatchPlayNumberColumn = { matchNumber: number, playNumber: number | null };
const sortMatchPlay: GridComparatorFn = (v1: MatchPlayNumberColumn, v2: MatchPlayNumberColumn, param1, param2) => {
  var matchNumberResult = gridNumberComparator(v1.matchNumber, v2.matchNumber, param1, param2);

  if (matchNumberResult !== 0) return matchNumberResult;

  return gridNumberComparator(v1.playNumber, v2.playNumber, param1, param2);
}

const tableColumns: GridColDef<Match[][number]>[] = [
  {
    field: 'tournament_level',
    headerName: 'Tournament Level',
    width: 150
  },
  {
    field: 'match_play_number',
    headerName: 'Match Number',
    width: 150,
    flex: 1,
    valueGetter: (_, row) => ({matchNumber: row.match_number, playNumber: row.play_number}),
    valueFormatter: (value: MatchPlayNumberColumn) => (`${value.matchNumber}` + (value.playNumber && value.playNumber !== 1 ? ` (Play ${value.playNumber})` : "")),
    sortComparator: sortMatchPlay
  },
  {
    field: 'red_alliance_teams',
    headerName: 'Red Alliance',
    width: 150,
    valueFormatter: (val: number[]) => val.join(", ")
  },
  {field: 'blue_alliance_teams', headerName: 'Blue Alliance', width: 150, valueFormatter: (val: number[]) => val.join(", ") },
  { field: 'scheduled_start_time', headerName: 'Scheduled Start', width: 150, valueFormatter: formatDate },
  { field: 'actual_start_time', headerName: 'Actual Start', width: 150, valueFormatter: formatDate },
  {
    field: 'actions',
    type: 'actions',
    sortable: false,
    filterable: false,
    hideable: false,
    headerName: 'Actions',
    getActions: (params) => [
      <GridActionsCellItem
        label={params.row.is_discarded ? "Undo Discard" : "Discard Match"}
        icon={<Delete />}
        showInMenu />
    ]
  },
  {
    field: 'is_discarded'
  }
];

const presetFilters: { label: string, filterModel: GridFilterModel }[] = [
  {
    label: 'All',
    filterModel: { items: [] }
  },
  {
    label: 'Qualification',
    filterModel: { items: [{field: 'tournament_level', operator: 'equals', value: 'Qualification'}] }
  },
  {
    label: 'Playoff',
    filterModel: { items: [{field: 'tournament_level', operator: 'equals', value: 'Playoff'}] }
  },
  {
    label: 'Discarded',
    filterModel: { items: [{field: 'is_discarded', operator: 'equals', value: 'true'}] }
  }
];

const EventsManageMatches = () => {
  const { id } = useParams();
  const matches = useGetMatchesForEvent(id!);
  const apiRef = useGridApiRef();
  const [filterTournamentLevel, setFilterTournamentLevel] = useState<TournamentLevel | null>(null);
  
  const tableToolbar = useMemo((): JSXElementConstructor<any> => {
    return () => (
      <DataTableFilterToolbar>
        <div>
          {presetFilters.map(filter => (
            <Button key={filter.label} variant="text" onClick={() => apiRef.current.setFilterModel(filter.filterModel)}>{filter.label}</Button>
          ))}
        </div>
      </DataTableFilterToolbar>
    );
  }, [setFilterTournamentLevel]);
  
  if (matches.isLoading) return (<Loading />);

  if (matches.isError) return (<Alert severity="error">Failed to get events</Alert>);
  
  if (matches.isSuccess) return (
    <Box>
    <DataGrid
      apiRef={apiRef}
      columns={tableColumns}
      rows={ filterTournamentLevel ? matches.data.filter(m => m.tournament_level == filterTournamentLevel) : matches.data}
      slots={{ toolbar: tableToolbar }}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 100
          }
        },
        sorting: {
          sortModel: [{
            field: 'match_play_number',
            sort: 'asc'
          }]
        },
        columns: {
          columnVisibilityModel: {
            is_discarded: false
          }
        }
      }}
      />
</Box>
  );
};

export default EventsManageMatches;