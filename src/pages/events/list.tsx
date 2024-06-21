import { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Button, Link, Alert } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { Link as RouterLink } from "react-router-dom";
import { EventSlim, getEventsForSeason } from "src/data/supabase/events";
import { useSupaQuery } from "src/hooks/useSupaQuery";
import { getSeasons } from "src/data/supabase/seasons";
import { Loading } from "src/shared/Loading";

function EventManageButton({ event }: { event: EventSlim }) {
  return (
    <Button component={RouterLink} to={`${event.id}`}>Manage</Button>
  )
}

const formatDate = (date: Date) => format(date, "PP");
const tableColumns: GridColDef<EventSlim[][number]>[] = [
  { field: 'key', headerName: 'Event Key', width: 150 },
  { field: 'code', headerName: 'Event Code', width: 150 },
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
  {
    field: 'truck_routes.name',
    valueGetter: (_, row) => row.truck_routes?.name,
    headerName: 'Route',
    renderCell: (params) => (
      params.row.truck_routes?.id
        ? <Link component={RouterLink} to={`/routes/${params.row.truck_routes.id}`}>{params.row.truck_routes?.name}</Link>
        : <></>
      )
  },
  { field: 'start_time', headerName: 'Start', valueFormatter: formatDate },
  { field: 'end_time', headerName: 'End', valueFormatter: formatDate },
  { field: 'status', headerName: 'Status' },
  { 
    field: 'actions',
    sortable: false,
    filterable: false,
    hideable: false,
    headerName: 'Actions',
    renderCell: (params) => (<EventManageButton event={params.row} />)
  }
];

function EventsList() {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  const getEventsQuery = useSupaQuery({
    queryKey: ['getEventsForSeason', selectedSeason],
    queryFn: async (client) => {
      if (!selectedSeason) return [];
      return getEventsForSeason(client, selectedSeason);
    }
  });

  const getSeasonsQuery = useSupaQuery({
    queryKey: ['getSeasons'],
    queryFn: async (client) => {
      return getSeasons(client);
    }
  });

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

  return (
    <>
      {getSeasonsQuery.isLoading && <Loading />}
      {getSeasonsQuery.isFetched && <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="seasonLabel">Season</InputLabel>
        <Select
          labelId="seasonLabel"
          value={getSeasonsQuery.data?.some(s => s.id == selectedSeason) ? selectedSeason : ''}
          label="Season"
          onChange={(e) => setSelectedSeason(e.target.value as (number | null))}
        >
          {(getSeasonsQuery.data ?? []).map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.levels.name})</MenuItem>)}
        </Select>
      </FormControl>}

      {!selectedSeason && <Alert severity="info">
          Select a season to view events
        </Alert>}

      {selectedSeason && <>
        {getEventsQuery.isLoading && <Loading />}
        {getEventsQuery.isError && <Alert severity="error">Failed to get events</Alert>}
        {getEventsQuery.isSuccess && <DataGrid
          autoHeight
          columns={tableColumns}
          rows={getEventsQuery.data}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 100
              }
            },
            sorting: {
              sortModel: [{
                field: 'start_time',
                sort: 'desc'
              }]
            }
          }}
        />}
      </>}
    </>
  );
}

export default EventsList;
