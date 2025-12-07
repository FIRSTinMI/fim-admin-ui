import { Match, TournamentLevel, tournamentLevelPlayOrder, useGetMatchesForEvent } from "src/data/supabase/matches.ts";
import { useParams } from "react-router-dom";
import { Loading } from "src/shared/Loading.tsx";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridComparatorFn,
  GridFilterModel,
  gridNumberComparator,
  useGridApiRef
} from "@mui/x-data-grid";
import format from "date-fns/format";
import { Alert, Box, Button, styled, Tooltip } from "@mui/material";
import { JSXElementConstructor, useMemo } from "react";
import { Delete, Restore } from "@mui/icons-material";
import DataTableFilterToolbar from "src/shared/DataTableFilterToolbar.tsx";
import { useSetMatchIsDiscarded } from "src/data/admin-api/matches.ts";
import { differenceInMinutes } from "date-fns";
import useHasEventPermission from "src/hooks/useHasEventPermission.ts";
import { GlobalPermission } from "src/data/globalPermission.ts";
import { EventPermission } from "src/data/eventPermission.ts";
import { useRefreshMatchResults } from "src/data/admin-api/events.ts";
import MutationButton from "src/shared/MutationButton.tsx";

const formatDate = (date: Date | null) => {
  if (date === null) return "";
  
  return format(date, "EEE p")
};

const StrickenSpan = styled("span")(({theme}) => ({
  textDecoration: 'line-through',
  textDecorationColor: theme.palette.text.secondary,
}))

type MatchPlayNumberColumn = { level: TournamentLevel, matchNumber: number, playNumber: number | null };
const sortMatchPlay: GridComparatorFn = (v1: MatchPlayNumberColumn, v2: MatchPlayNumberColumn, param1, param2) => {
  const levelResult = gridNumberComparator(tournamentLevelPlayOrder(v1.level), tournamentLevelPlayOrder(v2.level), param1, param2);
  
  if (levelResult !== 0) return levelResult;
  
  const matchNumberResult = gridNumberComparator(v1.matchNumber, v2.matchNumber, param1, param2);

  if (matchNumberResult !== 0) return matchNumberResult;

  return gridNumberComparator(v1.playNumber, v2.playNumber, param1, param2);
}

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
  const { id: eventId } = useParams();
  const canManageInfo = useHasEventPermission(eventId, [GlobalPermission.Events_Manage], [EventPermission.Event_ManageInfo]);
  const matches = useGetMatchesForEvent(eventId!);
  const apiRef = useGridApiRef();
  const setIsDiscardedMutation = useSetMatchIsDiscarded();
  const refreshMatchesMutation = useRefreshMatchResults();
  
  const columnConfig = useMemo<GridColDef<Match[][number]>[]>(() => ([
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
      valueGetter: (_, row) => ({level: row.tournament_level, matchNumber: row.match_number, playNumber: row.play_number}),
      valueFormatter: (value: MatchPlayNumberColumn) => (`${value.matchNumber}` + (value.playNumber && value.playNumber !== 1 ? ` (Play ${value.playNumber})` : "")),
      sortComparator: sortMatchPlay,
      renderCell: (params) => (params.row.is_discarded ? <Tooltip title="Results Discarded"><StrickenSpan>{params.formattedValue}</StrickenSpan></Tooltip> : <>{params.formattedValue}</> )
    },
    {
      field: 'red_alliance_teams',
      headerName: 'Red Alliance',
      width: 150,
      valueFormatter: (val: number[]) => val?.join(", ")
    },
    {
      field: 'blue_alliance_teams',
      headerName: 'Blue Alliance',
      width: 150,
      valueFormatter: (val: number[]) => val?.join(", ")
    },
    { field: 'scheduled_start_time', headerName: 'Scheduled Start', width: 125, valueFormatter: formatDate },
    { field: 'actual_start_time', headerName: 'Actual Start', width: 125, valueFormatter: formatDate },
    {
      field: 'ahead_behind',
      headerName: 'Ahead/Behind',
      width: 125,
      valueGetter: (_, row) =>
        row.actual_start_time && row.scheduled_start_time ? differenceInMinutes(row.scheduled_start_time, row.actual_start_time) : null,
      valueFormatter: (val: number | null) => val === null ? '' : (
        val === 0 ? 'On time!' : (
          val > 0 ? `${val}m early` : `${Math.abs(val)}m late`
        )
      )
    },
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
          icon={params.row.is_discarded ? <Restore /> : <Delete />}
          onClick={async () => await setIsDiscardedMutation.mutateAsync({
            matchId: params.row.id,
            eventId: eventId!,
            isDiscarded: !params.row.is_discarded
          })}
          showInMenu />
      ]
    },
    {
      field: 'is_discarded',
      headerName: 'Is Discarded'
    }
  ]), []);
  
  const tableToolbar = useMemo((): JSXElementConstructor<any> => {
    return () => (
      <DataTableFilterToolbar>
        <div>
          <span style={{textTransform: 'uppercase'}}>Filters:</span>
          {presetFilters.map(filter => (
            <Button key={filter.label} variant="text" onClick={() => apiRef.current.setFilterModel(filter.filterModel)}>
              {filter.label}
            </Button>
          ))}
        </div>
      </DataTableFilterToolbar>
    );
  }, [apiRef.current]);
  
  if (matches.isLoading || setIsDiscardedMutation.isPending) return (<Loading />);

  if (matches.isError) return (<Alert severity="error">Failed to get events</Alert>);
  
  if (matches.isSuccess) return (
    <Box sx={{paddingBottom: 5}}>
      {canManageInfo && (
        <MutationButton mutation={refreshMatchesMutation} onClick={() => refreshMatchesMutation.mutateAsync(eventId!)}>Refresh Match Results</MutationButton>
      )}
      <DataGrid
        apiRef={apiRef}
        columns={columnConfig}
        rows={ matches.data }
        slots={{ toolbar: tableToolbar }}
        hideFooter={true}
        initialState={{
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