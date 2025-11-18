import { Alert, AlertTitle, Box, Button, Checkbox, FormControl, FormControlLabel, InputLabel, Link, MenuItem, Select, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { createEventsFromSyncSource, CreateEventsResponse, SyncSourceRequest } from "src/data/admin-api/create-events";
import { Season, useGetSeasons } from "src/data/supabase/seasons";
import { useSupaMutation } from "src/hooks/useSupaMutation";
import { LoadingButton } from "@mui/lab";
import { DataSource } from "src/data/admin-api/events.ts";


const getValidSourcesForSeason = (season: Season): DataSource[] => {
  if (season.levels.name == "FRC") return ["FrcEvents", "BlueAlliance"];
  if (season.levels.name == "FTC") return ["FtcEvents"];
  return ["FrcEvents", "BlueAlliance", "FtcEvents"];
}

function Step1({ setResult }: { setResult: (r: CreateEventsResponse | null) => void }) {
  const createMutation = useSupaMutation({
    mutationFn: (client, req: SyncSourceRequest) => createEventsFromSyncSource(client, req)
  });

  const form = useForm<{ eventCodesUserInput?: string } & SyncSourceRequest>({
    defaultValues: {
      overrideExisting: false,
      seasonId: 0,
      dataSource: 'FrcEvents',
      districtCode: null,
      eventCodesUserInput: '',
      eventCodes: [],
      isOfficial: false
    },
    onSubmit: async (form) => {
      const value = form.value;
      value.eventCodes = value.eventCodesUserInput?.split(/[\s,]/).map(c => c.trim()).filter(c => c !== '') ?? [];
      value.eventCodesUserInput = undefined;
      await createMutation.mutateAsync(value, {
        onSuccess: (data) => setResult(data)
      });
    },
  });

  const seasons = useGetSeasons();

  const [validDataSources, setValidDataSources] = useState<DataSource[]>([]);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}>
      <Box display="flex" flexDirection="row" sx={{ gap: 1, pb: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="seasonLabel">Season</InputLabel>
          <form.Field name="seasonId">{
            ({ state, handleChange, handleBlur }) =>
            (<Select
              labelId="seasonLabel"
              value={seasons.data?.some(s => s.id == state.value) ? state.value : ''}
              label="Season"
              onChange={(e) => {
                const value = e.target.value as number;
                const season = seasons.data?.find(s => s.id == value);
                setValidDataSources(season ? getValidSourcesForSeason(season) : []);
                handleChange(e.target.value as number);
              }}
              onBlur={handleBlur}
            >
              {(seasons.data ?? []).map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.levels.name})</MenuItem>)}
            </Select>)
            }
          </form.Field>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="dataSourceLabel">Data Source</InputLabel>
          <form.Field name="dataSource">{
            ({ state, handleChange, handleBlur }) =>
            (<Select
              disabled={validDataSources.length === 0}
              labelId="dataSourceLabel"
              value={validDataSources.some(s => s === state.value) ? state.value : ''}
              label="Data Source"
              onChange={(e) => handleChange(e.target.value as DataSource)}
              onBlur={handleBlur}
            >
              {(validDataSources ?? []).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>)
            }
          </form.Field>
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="row" sx={{ gap: 1, mb: 2 }}>
        <FormControl fullWidth>
          <form.Field name="districtCode">{
            ({ state, handleChange, handleBlur }) => (
              <TextField
                label="District Code"
                autoComplete="off"
                variant="outlined"
                value={state.value ?? ''}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
              />
            )}
          </form.Field>
        </FormControl>
        <Typography variant="body2" sx={{ textWrap: "nowrap", mt: 2 }}>- or -</Typography>
        <FormControl fullWidth>
          <form.Field name="eventCodesUserInput">{
            ({ state, handleChange, handleBlur }) => (
              <TextField
                label="Event Codes"
                multiline
                autoComplete="off"
                variant="outlined"
                value={state.value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
              />
            )}
          </form.Field>
        </FormControl>
      </Box>

      <Box display="flex" flexDirection="row" sx={{ gap: 1, mb: 2 }}>
        <FormControl>
          <form.Field name="overrideExisting">{
            ({ state, handleChange, handleBlur }) => (
              <FormControlLabel control={<Checkbox
                value={state.value}
                onChange={(e) => handleChange(e.target.checked)}
                onBlur={handleBlur}
              />} label="Override Existing Events?" />
            )}
          </form.Field>
        </FormControl>
        <FormControl>
          <form.Field name="isOfficial">{
            ({ state, handleChange, handleBlur }) => (
              <FormControlLabel control={<Checkbox
                value={state.value}
                onChange={(e) => handleChange(e.target.checked)}
                onBlur={handleBlur}
              />} label="Official Events?" />
            )}
          </form.Field>
        </FormControl>
      </Box>

      {createMutation.isPending
        ? <LoadingButton loading />
        : <Button variant="contained" type="submit">Create</Button>}
    </form>
  )
}

const formatDate = (date: Date) => date ? format(date, "PP") : null;
const step2TableColumns: GridColDef<CreateEventsResponse['upsertedEvents'][number]>[] = [
  { field: 'key', headerName: 'Event Key', width: 150 },
  { field: 'code', headerName: 'Event Code', width: 150 },
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 150, renderCell: (params) => (
    <Link component={RouterLink} to={`/events/${params.row.id}`} target="_blank">{params.value}</Link>
  ) },
  { field: 'start_time', headerName: 'Start', width: 110, valueFormatter: formatDate },
  { field: 'end_time', headerName: 'End', width: 110, valueFormatter: formatDate },
  { field: 'status', headerName: 'Status' }
];

function Step2({ result }: { result: CreateEventsResponse }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {result.errors.length > 0 && <Alert severity="error">
          <AlertTitle>Errors</AlertTitle>
          <ul>
            {result.errors.map((err, i) => (<li key={i}>{err}</li>))}
          </ul>
        </Alert>}
      {result.warnings.length > 0 && <Alert severity="warning">
          <AlertTitle>Warnings</AlertTitle>
          <ul>
            {result.warnings.map((err, i) => (<li key={i}>{err}</li>))}
          </ul>
        </Alert>}
      
      <DataGrid autoHeight columns={step2TableColumns} rows={result.upsertedEvents} initialState={{
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
        }
      }} slots={{
        noRowsOverlay: () => (<Typography sx={{ textAlign: 'center', mt: 3 }}>No events were created</Typography>)
      }} />
    </Box>
  );
}

function EventsCreate() {
  const [step, setStep] = useState<number>(1);
  const [result, setResult] = useState<CreateEventsResponse | null>(null);

  return (<>
    <Typography variant="h3">Create from Sync Source</Typography>

    <Stepper activeStep={step} alternativeLabel sx={{ py: 2 }}>
      <Step completed={step >= 2} active={step == 1}>
        <StepLabel>Provide Info</StepLabel>
      </Step>
      <Step completed={false} active={step == 2}>
        <StepLabel error={result !== null && !result.isSuccess}>Get Results</StepLabel>
      </Step>
    </Stepper>

    {step == 1 && <Step1 setResult={(result) => {
      setStep(2);
      setResult(result);
    }} />}

    {step == 2 && <Step2 result={result!} />}
  </>);
}

export default EventsCreate;
