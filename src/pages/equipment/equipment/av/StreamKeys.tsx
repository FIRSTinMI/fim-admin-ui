import { Equipment } from "src/data/supabase/equipment";
import {
  Stack,
  List,
  ListItemText,
  ListItemButton,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Checkbox,
  Typography,
  ListItemIcon,
  Tooltip,
  ListItem,
  IconButton,
  Grid2,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  Add,
  Close,
  Download,
  PlayArrow,
  QuestionMark,
  Save,
  Stop,
  YouTube,
} from "@mui/icons-material";
import {
  AvCartConfiguration,
  controlCartStream,
  StreamItem,
  updateCartStreamKeys,
} from "src/data/admin-api/av-cart-tools";
import { useSupaMutation } from "src/hooks/useSupaMutation";
import useNotifyMutationStatus from "src/hooks/useNotifyMutationStatus";

interface IProps {
  hardware: Equipment<AvCartConfiguration>;
}

interface IStreamItemEditorProps {
  item?: StreamItem;
  onComplete?: (item: StreamItem) => void;
}

const StreamItemEditor = ({ item, onComplete }: IStreamItemEditorProps) => {
  if (!item) return <></>;

  const [data, setData] = useState(item);

  useEffect(() => {
    setData(item);
  }, [item]);

  const changed = JSON.stringify(data) !== JSON.stringify(item);

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onComplete?.(data);
      // unfocus whatever is focused
      const focusedElement = document.activeElement;
      if (
        focusedElement &&
        typeof (focusedElement as any).blur === "function"
      ) {
        // @ts-ignore blur does exist on HTMLElement in some cases
        focusedElement.blur();
      }
    }
  };

  return (
    <Card
      variant="elevation"
      sx={{ width: "100%", height: "100%" }}
      onKeyDown={handleEnterKey}
    >
      <CardHeader title={`Stream #${data.Index + 1}`} />
      <CardContent>
        <Stack direction={"column"} spacing={2}>
          <TextField
            label="Stream URL"
            value={data.RtmpUrl}
            onChange={(e) => setData({ ...data, RtmpUrl: e.target.value })}
            fullWidth
          />
          <TextField
            label="Stream Key"
            value={data.RtmpKey}
            onChange={(e) => setData({ ...data, RtmpKey: e.target.value })}
            fullWidth
          />
          <Stack direction="row">
            <Checkbox
              checked={data.Enabled}
              onChange={(e) => setData({ ...data, Enabled: e.target.checked })}
            />
            <Typography variant="body1" sx={{ my: "auto" }}>
              Enabled
            </Typography>
          </Stack>
          {changed && data.Enabled && (
            <Typography variant="caption">
              *Save changes and download keys to cart to see changes
            </Typography>
          )}
          {!data.Enabled && (
            <Typography variant="caption">
              *Enable stream to start stream
            </Typography>
          )}
          {data.Enabled && !changed && (
            <Typography variant="caption">
              *Be sure to force configuration to cart to see changes and restart
              the stream
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={() => onComplete?.(data)}
            startIcon={<Save />}
            disabled={!changed}
            sx={{ alignSelf: "flex-end" }}
          >
            Save
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

const StreamKeys = ({ hardware }: IProps) => {
  const [selected, setSelected] = useState(0);
  const [streams, setStreams] = useState(hardware.configuration.StreamInfo);

  const updateMutation = useSupaMutation({
    mutationFn: (client, streams: StreamItem[]) =>
      updateCartStreamKeys(client, hardware.id!, streams),
  });

  const startStopMutation = useSupaMutation({
    mutationFn: (
      client,
      {
        mode,
        streamNumber,
      }: { streamNumber?: number; mode: "start" | "stop" | "push-keys" }
    ) => controlCartStream(client, hardware.id!, mode, streamNumber),
  });

  useNotifyMutationStatus(
    startStopMutation,
    `Successfully requested stream control. Monitor cart logs for status updates.`,
    `Failed to request stream control`
  );

  const controlStream = (
    mode: "start" | "stop" | "push-keys",
    streamNumber?: number
  ) => {
    startStopMutation.mutate({ streamNumber, mode });
  };

  useNotifyMutationStatus(
    updateMutation,
    "Successfully updated",
    "Failed to update stream keys"
  );

  // just wait for the time when someone updates the stream keys on a different machine and you changes get wiped out trolololololol
  useEffect(() => {
    setStreams(hardware.configuration.StreamInfo);
  }, [hardware.configuration.StreamInfo]);

  const onUpdate = (item: StreamItem) => {
    const newStreams = [...streams];
    const oldIndex = newStreams.findIndex((k) => k.Index === item.Index);
    newStreams[oldIndex] = item;

    setStreams(newStreams);

    updateMutation.mutate(newStreams);
  };

  const KeyIcon = ({ item }: { item: StreamItem }) => {
    if (!item || !item.RtmpUrl) return <Close />;

    if (item.RtmpUrl?.indexOf("youtube") !== -1) {
      return <YouTube />;
    } else if (item.RtmpUrl?.indexOf("restream") !== -1) {
      return (
        <img
          src="https://restream.io/favicon.ico"
          alt="Restream"
          style={{ width: 24, height: 24 }}
        />
      );
    } else if (item.RtmpUrl?.indexOf("firststudios.live") !== -1) {
      return (
        <img
          src="https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FIRST-Icon.png"
          alt="First Studios"
          style={{ width: 24, height: 16 }}
        />
      );
    } else if (item.RtmpUrl?.indexOf("twitch") !== -1) {
      return (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/26/Twitch_logo.svg"
          alt="Twitch"
          style={{ width: 24, height: 24 }}
        />
      );
    } else {
      return <QuestionMark />;
    }
  };

  return (
    <Grid2 container direction="row" spacing={2}>
      {/* Stream Selector / Push Keys Button */}
      <Grid2
        size={{ sm: 12, md: 6, lg: 3 }}
        component={Stack}
        direction="column"
        spacing={2}
      >
        <List>
          {streams.map((key) => (
            <ListItem
              key={key.Index}
              onClick={() => setSelected(key.Index)}
              disablePadding
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Request Stream Start">
                    <IconButton
                      disabled={!key.Enabled}
                      onClick={() => controlStream("start", key.Index)}
                    >
                      <PlayArrow fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Request Stream Stop">
                    <IconButton
                      onClick={() => controlStream("stop", key.Index)}
                    >
                      <Stop fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            >
              <ListItemButton selected={selected === key.Index}>
                <ListItemIcon>
                  <KeyIcon item={key} />
                </ListItemIcon>
                <ListItemText
                  primary={`Stream #${key.Index + 1}`}
                  secondary={key.Enabled ? key.RtmpUrl : "Disabled"}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {streams.length < 5 && (
            <ListItemButton
              selected={selected === -1}
              onClick={() => {
                const newKey = {
                  Index: streams.length,
                  RtmpUrl: "",
                  RtmpKey: "",
                  Enabled: false,
                  CartId: hardware.id!,
                };
                setStreams([...streams, newKey]);
                setSelected(newKey.Index);
              }}
            >
              <ListItemIcon>
                <Add />
              </ListItemIcon>
              <ListItemText primary="Add Stream" />
            </ListItemButton>
          )}
        </List>

        <Button
          onClick={() => controlStream("push-keys")}
          startIcon={<Download />}
        >
          Force Config to Cart
        </Button>
      </Grid2>

      <Grid2 size={{ sm: 12, md: 6, lg: 9 }}>
        <StreamItemEditor
          key={selected}
          item={streams.find((k) => k.Index === selected)}
          onComplete={onUpdate}
        />
      </Grid2>
    </Grid2>
  );
};

export default StreamKeys;
