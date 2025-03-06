import {
  ChevronLeft,
  ChevronRight,
  Code,
  Error,
  Info,
  Report,
  Warning,
  Launch,
  Refresh,
} from "@mui/icons-material";
import {
  Stack,
  Box,
  Typography,
  Checkbox,
  IconButton,
  Select,
  MenuItem,
  LinearProgress,
  useTheme,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  EquipmentLog,
  useGetEquipmentLogs,
  useGetEquipmentOfType,
} from "src/data/supabase/equipment";
import Timestamp from "./Timestamp";
import { stringToColor } from "./util";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@ebay/nice-modal-react";
import JsonModal from "./JsonModal";

interface IProps {
  equipment_id: string;
  defaultSeverities?: string[];
  showDevice?: boolean;
}

// Known Categories
const categories = {
  autoav_general: "AutoAV General",
  autoav_recording: "AutoAV Recording",
  autoav_fms: "AutoAV FMS",
  general: "General",
};

// Known Severities
const severities = ["Debug", "Info", "Warn", "Error", "Fatal"];

const EquipmentLogViewer = ({
  equipment_id,
  defaultSeverities,
  showDevice,
}: IProps) => {
  const queryClient = useQueryClient();

  // Log "Table" State
  const [pageSize, setPageSize] = useState(10);
  const [relativeTime, setRelativeTime] = useState(true);
  const [page, setPage] = useState(0);

  // Filter State
  const [category, setCategory] = useState<string[] | "*">(
    Object.keys(categories)
  );
  const [severity, setSeverity] = useState<string[] | "*">(
    defaultSeverities ?? severities
  );
  const [deviceNameMap, setDeviceNameMap] = useState<{ [key: string]: string }>(
    {}
  );
  const [equipments, setEquipments] = useState<string[] | "*">("*");

  // Theme
  const theme = useTheme();

  // Get logs
  const logs = useGetEquipmentLogs(
    showDevice ? equipments : equipment_id!,
    pageSize,
    page * pageSize,
    category,
    severity
  );

  // Use Modal for viewing JSON
  const modal = useModal(JsonModal);

  // If showDevice is true, we need to get the device name, so lets fetch the equipment
  const equipment = showDevice ? useGetEquipmentOfType(-1) : { data: [] };

  // If showDevice is true, we need to get the device name, so lets fetch the equipment
  useEffect(() => {
    if (equipment.data && showDevice) {
      const map: { [key: string]: string } = {};
      equipment.data.forEach((e) => {
        map[e.id] = e.name;
      });
      setDeviceNameMap(map);
    }
  }, [equipment.data, showDevice]);

  // We're going to shim all of the setState functions so we an invalidate the query before updating the state causing the new query to run.
  // This way, we don't keep a bunch of useless supabase connections open.
  const updatePage = (newPage: number) => {
    queryClient.removeQueries({ queryKey: ["equipmentLogs"] });
    setPage(newPage);
  };

  const updatePageSize = (newPageSize: number) => {
    queryClient.removeQueries({ queryKey: ["equipmentLogs"] });
    setPageSize(newPageSize);
  };

  const updateCategory = (newCategory: string[] | "*") => {
    queryClient.removeQueries({ queryKey: ["equipmentLogs"] });
    setCategory(newCategory);
  };

  const updateSeverity = (newSeverity: string[] | "*") => {
    queryClient.removeQueries({ queryKey: ["equipmentLogs"] });
    setSeverity(newSeverity);
  };

  const updateEquipments = (newEquipments: string[] | "*") => {
    queryClient.removeQueries({ queryKey: ["equipmentLogs"] });
    setEquipments(newEquipments);
  };

  // calculate the color of the given string severity
  const calcSeverityColor = (severity: EquipmentLog["severity"]) => {
    switch (severity) {
      case "Debug":
        return theme.palette.info.main;
      case "Info":
        return theme.palette.text.primary;
      case "Warn":
        return theme.palette.warning.main;
      case "Error":
        return theme.palette.error.main;
      case "Fatal":
        return theme.palette.error.dark;
      default:
        return theme.palette.text.primary;
    }
  };

  // Severity Icon
  const SeverityIcon = ({
    severity,
  }: {
    severity: EquipmentLog["severity"];
  }) => {
    const icon = () => {
      const props = {
        fontSize: "inherit",
        sx: {
          color: calcSeverityColor(severity),
        },
      } as any;

      switch (severity) {
        case "Debug":
          return <Code {...props} />;
        case "Info":
          return <Info {...props} />;
        case "Warn":
          return <Warning {...props} />;
        case "Error":
          return <Error {...props} />;
        case "Fatal":
          return <Report {...props} />;
        default:
          return <Info {...props} />;
      }
    };

    return <Tooltip title={severity}>{icon()}</Tooltip>;
  };

  const openJson = (log: EquipmentLog) => {
    modal.show({
      jsonData: log.extra_info,
      title: `${log.log_message}`,
    });
  };

  return (
    <>
      {/* Filter Card */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardHeader title="Filter" />
        <CardContent>
          <Stack direction={"row"} spacing={2}>
            {/* Category Selector */}
            <Stack
              direction="row"
              spacing={2}
              alignItems={"center"}
              sx={{ width: showDevice ? 1 / 3 : "50%" }}
            >
              <Typography variant="body2" display={"inline"} sx={{ mr: 1 }}>
                Category
              </Typography>
              <Select
                value={category === "*" ? Object.keys(categories) : category}
                multiple
                onChange={(e) =>
                  updateCategory(
                    // If all the categories are selected, set to "*" which should make the query marginally faster
                    Array.isArray(e.target.value)
                      ? e.target.value.length === Object.keys(categories).length
                        ? "*"
                        : e.target.value
                      : [e.target.value]
                  )
                }
                variant="standard"
                size="small"
                fullWidth
                sx={{ mb: 2 }}
              >
                {Object.entries(categories).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            {/* Severity Selector */}
            <Stack
              direction="row"
              spacing={2}
              alignItems={"center"}
              sx={{ width: showDevice ? 1 / 3 : "50%" }}
            >
              <Typography variant="body2" display={"inline"} sx={{ mr: 1 }}>
                Severity
              </Typography>
              <Select
                value={severity === "*" ? severities : severity}
                multiple
                onChange={(e) =>
                  updateSeverity(
                    Array.isArray(e.target.value)
                      ? // If all the severities are selected, set to "*" which should make the query marginally faster
                        e.target.value.length === severities.length
                        ? "*"
                        : e.target.value
                      : [e.target.value]
                  )
                }
                variant="standard"
                size="small"
                fullWidth
                sx={{ mb: 2 }}
              >
                {severities.map((key) => (
                  <MenuItem key={key} value={key}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            {/* Equipment Selector */}
            {showDevice && (
              <>
                {/* Severity Selector */}
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems={"center"}
                  sx={{ width: showDevice ? 1 / 3 : "50%" }}
                >
                  <Typography variant="body2" display={"inline"} sx={{ mr: 1 }}>
                    Equipment
                  </Typography>
                  <Select
                    value={
                      equipments === "*"
                        ? Object.keys(deviceNameMap)
                        : equipments
                    }
                    multiple
                    onChange={(e) =>
                      updateEquipments(
                        Array.isArray(e.target.value)
                          ? // If all the devices are selected, set to "*" which should make the query marginally faster
                            e.target.value.length ===
                            Object.keys(deviceNameMap).length
                            ? "*"
                            : e.target.value
                          : [e.target.value]
                      )
                    }
                    variant="standard"
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {Object.entries(deviceNameMap).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Log Viewer Card */}
      <Card variant="outlined">
        <CardContent>
          {/* Log View Editor */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{ mt: "0 !important" }}
          >
            {/* Relative Time Selector */}
            <Box>
              <Typography
                variant="body2"
                display={"inline"}
                sx={{ my: "auto" }}
              >
                Relative Time
              </Typography>
              <Checkbox
                checked={relativeTime}
                onChange={(e) => setRelativeTime(e.target.checked)}
              />
            </Box>

            {/* Pagination */}
            <Stack direction="row" spacing={2} alignItems={"center"}>
              <IconButton
                onClick={() => updatePage(page < 1 ? 0 : page - 1)}
                disabled={page < 1}
              >
                <ChevronLeft />
              </IconButton>
              <Typography variant="body2" display={"inline"}>
                Page {page + 1}
              </Typography>
              <IconButton
                onClick={() => updatePage(page + 1)}
                disabled={
                  Array.isArray(logs.data) && logs.data.length < pageSize
                }
              >
                <ChevronRight />
              </IconButton>
            </Stack>

            {/* Page Size Selector */}
            <Stack direction="row" spacing={2} alignItems={"center"}>
              <Typography variant="body2" display={"inline"} sx={{ mr: 1 }}>
                Rows per page
              </Typography>
              <Select
                value={pageSize}
                onChange={(e) => updatePageSize(parseInt(`${e.target.value}`))}
                variant="standard"
                size="small"
                sx={{ mb: 2 }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
              
              <IconButton onClick={() => {queryClient.invalidateQueries({ queryKey: ["equipmentLogs"] });}}><Refresh color="primary" /></IconButton>
            </Stack>
          </Stack>

          <Divider sx={{}} />

          {logs.isLoading && <LinearProgress />}
          {logs.data?.map((log) => (
            <Stack
              direction="row"
              spacing={1}
              key={log.id}
              sx={{ mt: "0 !important", cursor: log.extra_info ? "pointer" : "default" }}
              alignItems={"center"}
              onClick={() => openJson(log)}
            >
              <SeverityIcon severity={log.severity} />
              {showDevice && (
                <Typography sx={{ color: stringToColor(log.equipment_id) }}>
                  {`${deviceNameMap[log.equipment_id] ?? log.equipment_id}`}
                </Typography>
              )}
              <Timestamp
                timestamp={log.log_time_utc}
                relative={relativeTime}
                fontColor={calcSeverityColor(log.severity)}
              />
              {log.extra_info && <Tooltip title="Extra Data"><Launch fontSize="inherit" /></Tooltip>}
              :{" "}
              <code>
                <pre style={{ margin: 0 }}>{log.log_message}</pre>
              </code>
            </Stack>
          ))}
        </CardContent>
      </Card>
    </>
  );
};

export default EquipmentLogViewer;
