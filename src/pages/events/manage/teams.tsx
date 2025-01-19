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
import { JSXElementConstructor, useMemo, useState } from "react";
import DataTableFilterToolbar from "src/shared/DataTableFilterToolbar.tsx";
import { EventTeam, useGetEventTeams, useGetEventTeamStatuses } from "src/data/supabase/events.ts";
import useHasEventPermission from "src/hooks/useHasEventPermission.ts";
import { GlobalPermission } from "src/data/globalPermission.ts";
import { EventPermission } from "src/data/eventPermission.ts";
import { useSupaMutation } from "src/hooks/useSupaMutation.ts";
import { updateEventTeam, UpdateEventTeamRequest } from "src/data/admin-api/events.ts";
import { useQueryClient } from "@tanstack/react-query";
import { Cancel, Edit, Save } from "@mui/icons-material";

const DATA_REFRESH_SEC = 60;

const presetFilters: { label: string, filterModel: GridFilterModel }[] = [
  {
    label: 'All',
    filterModel: { items: [] }
  }
];

const EventsManageMatches = () => {
  const { id: eventId } = useParams();
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const teams = useGetEventTeams(eventId!, {
    enabled: () => !Object.values(rowModesModel).some(r => r.mode == GridRowModes.Edit),
    refetchInterval: DATA_REFRESH_SEC * 1_000
  });
  const statuses = useGetEventTeamStatuses();
  const canManageTeams = useHasEventPermission(eventId!, [GlobalPermission.Events_Manage], [EventPermission.Event_ManageTeams]);
  const queryClient = useQueryClient();
  const updateTeamMutation = useSupaMutation({
    mutationFn: (client, req: UpdateEventTeamRequest) => updateEventTeam(client, req),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['getEventTeams', eventId]
      });
    }
  });
  const apiRef = useGridApiRef();
  
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };
  
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
        params.row.isLoading ? <GridSkeletonCell /> : <GridEditSingleSelectCell {...params} />
      )
    },
    {
      field: 'notes',
      headerName: 'Notes',
      width: 250,
      flex: 1,
      editable: canManageTeams,
      renderEditCell: params => (
        params.row.isLoading ? <GridSkeletonCell /> : <GridEditInputCell {...params} />
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

  if (teams.isLoading || statuses.isLoading) return (<Loading />);

  if (teams.isError) return (<Alert severity="error">Failed to get teams</Alert>);

  if (teams.isSuccess) return (
    <Box sx={{paddingBottom: 5}}>
      <Typography sx={{textAlign: 'center', paddingBottom: 2}}>
        {Object.values(rowModesModel).some(r => r.mode == GridRowModes.Edit)
          ? "Automatic refresh disabled while editing"
          : `Data automatically refreshes every ${DATA_REFRESH_SEC} seconds`}
      </Typography>
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
        onProcessRowUpdateError={(err) => {console.error(err)}}
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

export default EventsManageMatches;