import { useState, useEffect, useCallback, useMemo, JSXElementConstructor } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Link,
  Alert,
  Box,
  Divider,
  Typography, styled
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  useGridApiRef
} from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import { EventSlim, useGetEventsForSeason } from "src/data/supabase/events";
import { useGetSeasons } from "src/data/supabase/seasons";
import { Loading } from "src/shared/Loading";
import AddIcon from "@mui/icons-material/Add";
import useHasGlobalPermission from "src/hooks/useHasGlobalPermission";
import { GlobalPermission } from "src/data/globalPermission";
import DataTableFilterToolbar from "src/shared/DataTableFilterToolbar.tsx";
import { eventStatusToShortDescription } from "src/data/eventStatus.ts";
import { isWithinInterval } from "date-fns";
import StyledGridOverlay from "src/shared/StyledGridOverlay.tsx";
import usePersistTableState from "src/hooks/usePersistTableState.ts";
import { formatEventDate } from "src/shared/util.ts";

const WrappedDataGrid = styled('div')`
  max-width: 100%;
  overflow-x: scroll;
  .MuiDataGrid-virtualScroller {
    overflow-x: hidden;
  }
`;

let tableColumns: GridColDef<EventSlim[][number]>[] = [
  { field: 'key', headerName: 'Event Key', width: 150 },
  { field: 'code', headerName: 'Event Code', width: 150 },
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 150, renderCell: (params) => (
    <Link component={RouterLink} to={params.row.id}>{params.value}</Link>
  ) },
  {
    field: 'truck_routes.name',
    valueGetter: (_, row) => row.truck_routes?.name,
    headerName: 'Route',
    renderCell: (params) => (
      params.row.truck_routes?.id
        ? <Link component={RouterLink} to={`/routes/${params.row.truck_routes.id}`}>{params.value}</Link>
        : <></>
      ),
  },
  { field: 'start_time', headerName: 'Start', width: 110, valueFormatter: formatEventDate, type: "dateTime" },
  { field: 'end_time', headerName: 'End', width: 110, valueFormatter: formatEventDate, type: "dateTime" },
  {
    field: 'is_current',
    headerName: 'Is Current?',
    valueGetter: (_, row) =>
      isWithinInterval(new Date(), { start: row.start_time, end: row.end_time }),
    valueFormatter: (value) => (value === true ? 'Yes' : 'No')
  },
  { field: 'status', headerName: 'Status', valueFormatter: eventStatusToShortDescription, width: 150 },
];

const presetFilters: { label: string, filterModel: GridFilterModel }[] = [
  {
    label: 'All',
    filterModel: { items: [] }
  },
  {
    label: 'Current Events',
    filterModel: { items: [{field: 'is_current', operator: 'equals', value: "true"}] }
  }
];

function EventsList() {
  const grid = useGridApiRef();
  const initialState = usePersistTableState(grid, "events-list", 1, {
    pagination: {
      paginationModel: {
        pageSize: 100
      }
    },
    sorting: {
      sortModel: [{
        field: 'start_time',
        sort: 'asc'
      }]
    },
    columns: {
      columnVisibilityModel: {
        is_current: false
      }
    }
  });
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const hasCreatePermission = useHasGlobalPermission([GlobalPermission.Events_Create]);
  const [showKeys, setShowKeys] = useState(false);

  const getEventsQuery = useGetEventsForSeason(selectedSeason);
  const getSeasonsQuery = useGetSeasons();

  useEffect(() => {
    const selected = localStorage.getItem('fim-admin-selected-season');
    if (selected) {
      setSelectedSeason(Number(selected));
    }
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    localStorage.setItem('fim-admin-selected-season', selectedSeason.toString());
  }, [selectedSeason]);
  
  useEffect(() => {
    const keyCol = tableColumns.findIndex(c => c.field === "key");
    if (keyCol >= 0) {
      tableColumns[keyCol].renderCell = showKeys ? undefined : (params) => "•".repeat(params.value.length);
    }
    if (grid.current?.updateColumns) {
      grid.current.updateColumns(tableColumns);
    }
  }, [grid?.current, showKeys]);
  
  const showHideKeys = useCallback(() => {
    if (showKeys) {
      setShowKeys(false);
    } else {
      setShowKeys(true);
    }
  }, [showKeys, setShowKeys]);
  
  const tableToolbar = useMemo((): JSXElementConstructor<any> => {
    return () => (
      <DataTableFilterToolbar>
        <>
          <Button variant="text" onClick={showHideKeys}>{showKeys ? "Hide" : "Show"} Keys</Button>
          <Divider orientation="vertical" variant="middle" flexItem sx={{ml: 1, mr: 2}} />
          
          <Typography sx={{alignSelf: "center"}}>Quick filters:</Typography> 
          {presetFilters.map(filter => (
            <Button key={filter.label} variant="text" onClick={() => grid.current.setFilterModel(filter.filterModel)}>
              {filter.label}
            </Button>
          ))}
          <div style={{flexGrow: 1}} />
        </>
      </DataTableFilterToolbar>
    );
  }, [showKeys, showHideKeys]);

  if (getSeasonsQuery.isLoading) return (<Loading />);
  if (getSeasonsQuery.isError) return (<Alert severity="error">Unable to get seasons!</Alert>);

  return (
    <Box sx={{maxWidth: '100%'}}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, maxWidth: '100%' }}>
        <FormControl fullWidth>
          <InputLabel id="seasonLabel">Season</InputLabel>
          <Select
            labelId="seasonLabel"
            value={getSeasonsQuery.data?.some(s => s.id == selectedSeason) ? selectedSeason : ''}
            label="Season"
            onChange={(e) => setSelectedSeason(e.target.value as (number | null))}
          >
            {(getSeasonsQuery.data ?? []).map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.levels.name})</MenuItem>)}
          </Select>
        </FormControl>
        {hasCreatePermission && 
          <span>
            <Button startIcon={<AddIcon />} component={RouterLink} to="create">Create</Button>
          </span>
        }
      </Box>

      {!selectedSeason && <Alert severity="info">
          Select a season to view events
        </Alert>}

      {selectedSeason && <>
        {(getEventsQuery.isLoading || !initialState) && <Loading />}
        {getEventsQuery.isError && <Alert severity="error">Failed to get events</Alert>}
        {getEventsQuery.isSuccess && initialState && <WrappedDataGrid sx={{ display: 'flex', flexDirection: 'column', minHeight: '400px', pb: '2em', maxWidth: '100%' }}>
          <DataGrid
            apiRef={grid}
            columns={tableColumns}
            rows={getEventsQuery.data}
            slots={{
              toolbar: tableToolbar,
              noRowsOverlay: () => (
                <StyledGridOverlay>No events exist for this season.</StyledGridOverlay>
              ),
              noResultsOverlay: () => (
                <StyledGridOverlay>No events were found that match your filter settings.</StyledGridOverlay>
              )
            }}
            initialState={initialState}
          />
        </WrappedDataGrid>}
      </>}
    </Box>
  );
}

export default EventsList;
