import { useParams } from "react-router-dom";
import { Loading } from "src/shared/Loading.tsx";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridEditInputCell,
  GridEditSingleSelectCell,
  GridFilterModel,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridSkeletonCell,
  useGridApiRef
} from "@mui/x-data-grid";
import { Alert, Box, Button, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import DataTableFilterToolbar from "src/shared/DataTableFilterToolbar.tsx";
import { EventTeam, useGetEventTeams, useGetEventTeamStatuses } from "src/data/supabase/events.ts";
import useHasEventPermission from "src/hooks/useHasEventPermission.ts";
import { GlobalPermission } from "src/data/globalPermission.ts";
import { EventPermission } from "src/data/eventPermission.ts";
import { useSupaMutation } from "src/hooks/useSupaMutation.ts";
import { refreshEventTeams, updateEventTeam, UpdateEventTeamRequest } from "src/data/admin-api/events.ts";
import { Cancel, Edit, Save } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";

const DATA_REFRESH_SEC = 60;

const presetFilters: { label: string, filterModel: GridFilterModel }[] = [
  {
    label: 'All',
    filterModel: { items: [] }
  }
];

const EventsManageTeams = () => {
  const { id: eventId } = useParams();
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const shouldRefetch = useMemo(() => !Object.values(rowModesModel).some(() => true) //r.mode == GridRowModes.Edit
  , [rowModesModel]);
  const queryClient = useQueryClient();
  const teams = useGetEventTeams(eventId!, {
    enabled: () => shouldRefetch,
    refetchInterval: DATA_REFRESH_SEC * 1_000
  });
  const statuses = useGetEventTeamStatuses();
  const canManageTeams = useHasEventPermission(eventId!, [GlobalPermission.Events_Manage], [EventPermission.Event_ManageTeams]);
  const updateTeamMutation = useSupaMutation({
    mutationFn: (client, req: UpdateEventTeamRequest) => updateEventTeam(client, req)
  });
  const refreshTeamsMutation = useSupaMutation({
    mutationFn: (client) => refreshEventTeams(client, eventId!),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["getEventTeams", eventId]
      })
    }
  });
  const apiRef = useGridApiRef();
  
  const handleEditClick = useCallback((id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  }, [setRowModesModel, rowModesModel]);

  const handleSaveClick = useCallback((id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  }, [setRowModesModel, rowModesModel]);

  const handleCancelClick = useCallback((id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  }, [setRowModesModel, rowModesModel]);

  const handleRowModesModelChange = useCallback((newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  }, [setRowModesModel]);
  
  const columnConfig: GridColDef[] = useMemo<GridColDef<(EventTeam & {isLoading: boolean | undefined})[][number]>[]>(() => ([
    {
      field: 'teamNumber',
      headerName: 'Team',
      width: 150
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      type: 'singleSelect',
      valueOptions: statuses.data,
      getOptionLabel: (val: any) => val.name,
      getOptionValue: (val: any) => val.id,
      editable: canManageTeams,
      renderEditCell: params => (
        params.row.isLoading ? <GridSkeletonCell style={{borderTop: 'none'}} /> : <GridEditSingleSelectCell {...params} />
      )
    },
    {
      field: 'notes',
      headerName: 'Notes',
      width: 250,
      flex: 1,
      editable: canManageTeams,
      renderEditCell: params => (
        params.row.isLoading ? <GridSkeletonCell style={{borderTop: 'none'}} /> : <GridEditInputCell {...params} />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({id}) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<Save/>}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<Cancel />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<Edit />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />
        ];
      },
    },
  ]), [statuses.data, canManageTeams, rowModesModel]);

  const tableToolbar = useMemo(() => {
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
  if (teams.isPending || statuses.isPending || refreshTeamsMutation.isPending) return (<Loading />);

  if (teams.isError) return (<Alert severity="error">Failed to get teams</Alert>);

  if (teams.isSuccess) return (
    <Box sx={{paddingBottom: 5}}>
      <Box sx={{ display: 'flex', justifyContent: 'center', paddingBottom: 2 }}>
        <Typography sx={{textAlign: 'center', flex: 1}}>
          {shouldRefetch
            ? `Data automatically refreshes every ${DATA_REFRESH_SEC} seconds`
            : "Automatic refresh disabled while editing"}
        </Typography>
        {canManageTeams && (
          <Button onClick={refreshTeamsMutation.mutateAsync}>Refresh Team List</Button>
        )}
      </Box>
      <DataGrid
        apiRef={apiRef}
        columns={columnConfig}
        rows={ teams.data }
        slots={{ toolbar: tableToolbar }}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        editMode={"row"}
        processRowUpdate={async (newRow, _row, {rowId}) => {
          apiRef.current.updateRows([{id: rowId, isLoading: true}]);

          await updateTeamMutation.mutateAsync({
            eventId: eventId!,
            eventTeamId: newRow.id,
            notes: newRow.notes !== '' ? newRow.notes : null,
            status: newRow.status
          });
          
          return {
            ...newRow,
            isLoading: false,
          };
          
        }}
        onProcessRowUpdateError={async (err) => {
          // If an update fails, we'll just bail out of edit mode and refresh the whole dataset to ensure consistency
          console.error(err);
          enqueueSnackbar("Failed to update team", {
            variant: 'error'
          });
          setRowModesModel(rows => {
            for (let key in rows) {
              rows[key] = {mode: GridRowModes.View, ignoreModifications: true}
            }
            
            return rows;
          });
          await teams.refetch();
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100
            }
          },
          sorting: {
            sortModel: [{
              field: 'teamNumber',
              sort: 'asc'
            }]
          }
        }}
      />
    </Box>
  );
};

export default EventsManageTeams;