import { Effect } from "effect";
import { useState, useContext, useMemo, useEffect } from "react";
import { SupabaseContext } from "../../supabaseContext";
import { FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { RemoteData, Loading, Failure, Success, isLoading, getData } from "../../shared/RemoteData";

type Season = {
  id: number,
  name: string,
  levels: {
    name: string
  }
};

type Event = {
  id: string,
  key: string,
  start_time: Date,
  end_time: Date,
  status: string,
  truck_routes: {
    id: number,
    name: string
  }
};

function EventManageButton({ event }: { event: Event }) {
  return (
    <Button component={Link} to={`${event.id}`}>Manage</Button>
  )
}

const formatDate = (date: Date) => format(date, "PP");
const tableColumns: GridColDef<Event[][number]>[] = [
  { field: 'key', headerName: 'Event Key', width: 150 },
  { field: 'code', headerName: 'Event Code', width: 150 },
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
  {
    field: 'truck_route',
    headerName: 'Route',
    renderCell: (params) => (
      params.row.truck_routes?.id
        ? <Button variant="text" component={Link} to={`/routes/${params.row.truck_routes.id}`}>{params.row.truck_routes.name}</Button>
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
  const supabase = useContext(SupabaseContext);

  const [seasons, setSeasons] = useState<RemoteData<Season[]>>(Loading());
  const [events, setEvents] = useState<RemoteData<Event[]>>(Loading());
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  const getSeasons = useMemo(() => 
    Effect.tryPromise(async () => {
      const res = await supabase.from("seasons").select("*,levels(*)").returns<Season[]>();
      if (res.error) return Failure({
        error: new Error(res.error.message)
      });
      return Success({ data: res.data });
    })
  , [supabase]);

  const getEvents = useMemo(() => 
    Effect.tryPromise(async () => {
      const res = await supabase.from("events").select("id,key,code,name,start_time,end_time,status,truck_routes(id,name)").eq('season_id', selectedSeason).returns<Event[]>();
      if (res.error) return Failure({
        error: new Error(res.error.message)
      });
      return Success({ data: res.data });
    })
  , [selectedSeason, supabase]);

  useEffect(() => {
    setSeasons(Loading());
    (async () => {
      setSeasons(await Effect.runPromise(getSeasons));
    })();
    const selected = localStorage.getItem('fim-admin-selected-season');
    if (selected) {
      setSelectedSeason(Number(selected));
    }
  }, [getSeasons]);

  useEffect(() => {
    if (!selectedSeason) return;
    localStorage.setItem('fim-admin-selected-season', selectedSeason.toString());
    setEvents(Loading());
    (async () => {
      setEvents(await Effect.runPromise(getEvents));
    })();
  }, [getEvents, selectedSeason]);
  return (
    <>
      {isLoading(seasons) && <p>Loading...</p>}
      {!isLoading(seasons) && <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="seasonLabel">Season</InputLabel>
        <Select
          labelId="seasonLabel"
          value={selectedSeason ?? ''}
          label="Season"
          onChange={(e) => setSelectedSeason(e.target.value as (number | null))}
        >
          {getData(seasons).map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.levels.name})</MenuItem>)}
        </Select>
      </FormControl>}

      {!isLoading(events) && <DataGrid
        autoHeight
        columns={tableColumns}
        rows={getData(events)}
        initialState={{
          sorting: {
            sortModel: [{
              field: 'start_time',
              sort: 'desc'
            }]
          }
        }}
       />}
    </>
  );
}

export default EventsList;
