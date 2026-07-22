import { useState, useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Link,
  Alert,
  Box,
  LinearProgress
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { EventDashboard, useGetEventDashboard } from "src/data/supabase/events";
import { useGetSeasons } from "src/data/supabase/seasons";
import { Loading } from "src/shared/Loading";
import AddIcon from "@mui/icons-material/Add";
import useHasGlobalPermission from "src/hooks/useHasGlobalPermission";
import { GlobalPermission } from "src/data/globalPermission";
import { eventStatusToShortDescription } from "src/data/eventStatus.ts";
import { differenceInMinutes, isWithinInterval } from "date-fns";
import { formatEventDate } from "src/shared/util.ts";
import usePersistedSeason from "src/hooks/usePersistedSeason.ts";
import { ColDef, ICellRendererParams, themeMaterial, Toolbar } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";

// TODO: reenable persisting state with usePersistTableState
// TODO: cleanup

let columnTypes: { [_: string]: ColDef } = {
  dateTime: {
    minWidth: 110,
    filter: 'agDateColumnFilter',
    valueFormatter: ({ value }) => formatEventDate(value)
  }
};

type EventDashboardRow = EventDashboard & {
  is_current: boolean,
  info: string
};

function EventsList() {
  const [selectedSeason, setSelectedSeason] = usePersistedSeason();
  const hasCreatePermission = useHasGlobalPermission([GlobalPermission.Events_Create]);
  const [showKeys, setShowKeys] = useState(false);

  let newTableColumns = useMemo<ColDef<EventDashboardRow>[]>(() => [
    {
      field: 'key',
      headerName: 'Event Key',
      width: 150,
      initialHide: true,
      cellRenderer: showKeys ? undefined : (params: ICellRendererParams) => "•".repeat(params.value.length)
    },
    { field: 'code', headerName: 'Event Code', width: 150 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 250, cellRenderer: (params: ICellRendererParams) => (
        <Link component={RouterLink} to={params.data.id}>{params.value}</Link>
      )
    },
    {
      field: 'truck_routes.name',
      valueGetter: (params) => params.data?.truck_routes?.name,
      headerName: 'Route',
      width: 150,
      cellRenderer: (params: ICellRendererParams) => (
        params.data?.truck_routes?.id
          ? <Link component={RouterLink} to={`/routes/${params.data?.truck_routes.id}`}>{params.value}</Link>
          : <></>
      ),
    },
    { field: 'start_time', width: 150, headerName: 'Start', type: 'dateTime' },
    { field: 'end_time', width: 150, headerName: 'End', type: 'dateTime' },
    {
      field: 'is_current',
      headerName: 'Is Current',
      width: 175,
      valueGetter: (params) =>
        params.data?.start_time &&
        params.data?.end_time &&
        isWithinInterval(new Date(), { start: params.data.start_time, end: params.data.end_time})
          ? 'Yes'
          : 'No',
      filter: true,
      initialHide: true
    },
    { field: "status",
      valueGetter: (params) =>
        eventStatusToShortDescription(params.data?.status),
      filter: true
    },
    { field: 'info', headerName: 'Last Match', width: 200, valueGetter: ({ data }) => {
        let result: string | null = null;
        if (!data || !data.last_match_num || !data.level_matches) return result;
        result = `${data.last_match_num} of ${data.level_matches}`;

        if (data.last_match_scheduled && data.last_match_actual) {
          const val = differenceInMinutes(data.last_match_scheduled, data.last_match_actual);
          const relativeDelay = val === 0 ? 'On time!' : (
            val > 0 ? `${val}m early` : `${Math.abs(val)}m late`
          )
          result += ` (${relativeDelay})`;
        }

        return result;
      }, sortable: false}
  ], [showKeys]);

  const toolbar: Toolbar = useMemo(() => ({
    items: [
      {
        label: showKeys ? 'Hide Keys' : 'Show Keys',
        action: (params) => {
          params.api.applyColumnState({
            state: [
              {
                colId: 'key',
                hide: showKeys
              }
            ],
          });
          setShowKeys(!showKeys);
        }
      },
      {
        toolbarItem: () => (<Box sx={{ml: 2}}>Quick Filters:</Box>)
      },
      {
        label: 'Current',
        action: (params) => params.api.setColumnFilterModel('is_current', {values: ['Yes']})
      },
      {
        label: 'All',
        action: (params) => {
          params.api.setFilterModel(null);
          params.api.setGridOption('quickFilterText', '');
        }
      },
      {
        alignment: 'right',
        key: 'copy',
        icon: 'clipboardCopy',
        action: (params) => {
          params.api.selectAll('filtered');
          params.api.copyToClipboard({
            includeHeaders: true
          });
        }
      },
      {
        alignment: 'right',
        toolbarItem: 'separator'
      },
      {
        alignment: 'right',
        toolbarItem: 'agQuickFilterToolbarItem'
      },
    ],
  }), [showKeys]);
  // const initialState = usePersistTableState(grid, "events-list", 1, {
  //   pagination: {
  //     paginationModel: {
  //       pageSize: 100
  //     }
  //   },
  //   sorting: {
  //     sortModel: [{
  //       field: 'start_time',
  //       sort: 'asc'
  //     }]
  //   },
  //   columns: {
  //     columnVisibilityModel: {
  //       is_current: false
  //     }
  //   }
  // });

  const getEventsQuery = useGetEventDashboard(selectedSeason);
  const getSeasonsQuery = useGetSeasons();

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
        {getEventsQuery.isError && <Alert severity="error">Failed to get events</Alert>}
        {getEventsQuery.isFetching && <Box sx={{width: '100%'}}><LinearProgress /></Box>}
        {getEventsQuery.isSuccess && 
          <Box sx={{ mb: 2 }}>
            <AgGridReact
              domLayout="autoHeight"
              columnTypes={columnTypes}
              columnDefs={newTableColumns}
              rowData={getEventsQuery.data}
              gridOptions={{
                theme: themeMaterial,
              }}
              rowSelection="multiple"
              toolbar={toolbar}
              cellSelection />
          </Box>
          }
      </>}
    </Box>
  );
}

export default EventsList;
