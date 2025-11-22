import { Delete, Stop, YouTube, MoreVert } from "@mui/icons-material";
import {
  ListItem,
  Tooltip,
  IconButton,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Stack,
  Chip,
  Menu,
  MenuItem,
  Link,
  Alert,
  Typography,
} from "@mui/material";
import React, { memo, useState } from "react";
import NiceModal from "@ebay/nice-modal-react";
import DeleteConfirmModal from "src/shared/DeleteConfirmModal";
import { useLivestreamDelete } from "src/data/admin-api/event-streams";
import {
  useGetYoutubeStreamStatuses,
  useStopYoutubeStream,
  YoutubeStreamStatus,
} from "src/data/admin-api/youtube";
import { EventStream } from "src/data/supabase/av-tools";

const StatusChip = ({
  status,
  onClick,
  loading,
}: {
  status?: YoutubeStreamStatus;
  onClick?: () => void;
  loading?: boolean;
}) => {
  const lifecycleTranslationMap: Record<YoutubeStreamStatus["lifeCycleStatus"], string> = {
    complete: "Completed",
    live: "Live",
    liveStarting: "Starting",
    ready: "Ready",
    revoked: "Revoked",
    testStarting: "Test Starting",
    testing: "Testing",
  };
  const streamTranslationMap: Record<YoutubeStreamStatus["streamStatus"], string> = {
    "active": "Broadcasting",
    "created": "No Data Yet",
    "error": "Stream Error",
    "inactive": "Not Sending Data",
    "ready": "Waiting For Data"
  };
  const colorMap: Record<
    YoutubeStreamStatus["lifeCycleStatus"],
    "default" | "primary" | "success" | "warning" | "error"
  > = {
    complete: "default",
    live: "success",
    liveStarting: "warning",
    ready: "primary",
    revoked: "error",
    testStarting: "warning",
    testing: "warning",
  };

  const getChipColor = (status?: YoutubeStreamStatus): "default" | "primary" | "success" | "warning" | "error" => {
    if (!status) return "default";
    
    if ((status.lifeCycleStatus === "live" || status.lifeCycleStatus === "testing") && !status.isLive)
      return "error";
    
    if (status.lifeCycleStatus === "ready" && !status.autoStart)
      return "default";
    
    return colorMap[status.lifeCycleStatus];
  }
  
  const getChipText = (status?: YoutubeStreamStatus): string => {
    if (!status) return "Unknown";

    if (status.lifeCycleStatus === "ready" && !status.autoStart)
      return "Disabled";
    
    let retVal = lifecycleTranslationMap[status.lifeCycleStatus];
    if ((status.lifeCycleStatus === "live" || status.lifeCycleStatus === "testing") && !status.isLive) {
      retVal += ` (${streamTranslationMap[status.streamStatus]})`;
    }
    
    return retVal;
  }

  return (
    <Tooltip title="Click to refresh status">
      <Chip
        label={getChipText(status)}
        color={getChipColor(status)}
        sx={{
          cursor: "pointer",
        }}
        onClick={onClick}
        icon={loading ? <CircularProgress size={12} /> : undefined}
      />
    </Tooltip>
  );
};

const WatchUrl = (stream: EventStream) => {
  if (stream.platform === "Youtube") {
    return `https://youtube.com/watch?v=${stream.internal_id}`;
  }
  if (stream.platform === "Twitch") {
    return `https://twitch.tv/${stream.channel}`;
  }
}

const LiveStreamRow = ({
  stream,
  refetch,
  acctId,
}: {
  stream: EventStream;
  refetch: () => void;
  acctId: string;
}) => {
  const deleteStream = useLivestreamDelete();
  const stopStream = useStopYoutubeStream();
  const youtubeStatuses = useGetYoutubeStreamStatuses(acctId);

  const myStatus = youtubeStatuses.data?.find(
    (status) => status.broadcastId === stream.internal_id
  );

  const runDeleteStream = (livestreamId: string) => {
    NiceModal.show(DeleteConfirmModal, {
      streamName: stream.title,
      title: 'Delete Stream',
      confirmText: 'Delete',
      onConfirm: () =>
        deleteStream
          .mutateAsync({
            livestreamId,
          })
          .finally(() => {
            refetch();
          }),
    });
  };

  const runStopStream = () => {
    NiceModal.show(DeleteConfirmModal, {
      streamName: stream.title,
      title: 'Stop Stream',
      confirmText: 'Stop',
      action: 'stop',
      onConfirm: () =>
        stopStream
          .mutateAsync({
            broadcastId: stream.internal_id,
            accountId: acctId,
          })
          .finally(() => {
            youtubeStatuses.refetch();
          }),
    });
  };

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
  const closeMenu = () => setMenuAnchor(null);

  const runRefreshStatus = () => {
    youtubeStatuses.refetch();
  };

  const cantStop = myStatus?.lifeCycleStatus === "complete" || myStatus?.autoStart === false;
  
  return (
    <ListItem
      sx={{".MuiListItemSecondaryAction-root": { height: "100%" }}}
      key={stream.id}
      secondaryAction={
        <Stack direction="row" spacing={1} alignItems="end" sx={{ mr: 8 }}>
          <StatusChip
            status={myStatus}
            onClick={runRefreshStatus}
            loading={youtubeStatuses.isFetching}
          />

          <IconButton aria-label="more" onClick={openMenu}>
            <MoreVert />
          </IconButton>

          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
            <MenuItem
              component={Link}
              href={WatchUrl(stream)}
              target="_blank"
              onClick={() => {
                closeMenu();
              }}
            >
              <ListItemIcon>
                <YouTube fontSize="small" />
              </ListItemIcon>
              Open stream
            </MenuItem>

            <MenuItem
              onClick={() => {
                closeMenu();
                runStopStream();
              }}
              disabled={!stopStream.isIdle || cantStop}
            >
              <ListItemIcon>
                {!stopStream.isIdle ? <CircularProgress size={18} /> : <Stop fontSize="small" />}
              </ListItemIcon>
              Stop stream
            </MenuItem>

            <MenuItem
              onClick={() => {
                closeMenu();
                runDeleteStream(stream.id);
              }}
              disabled={!deleteStream.isIdle}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                {!deleteStream.isIdle ? <CircularProgress size={18} /> : <Delete fontSize="small" color="error" />}
              </ListItemIcon>
              Delete stream
            </MenuItem>
          </Menu>
        </Stack>
      }
    >
      <ListItemIcon>
        {stream.platform.toLowerCase() === "twitch" ? (
          <img
            src="https://pngimg.com/d/twitch_PNG48.png"
            alt="Twitch"
            style={{ width: 24, height: 24 }}
          />
        ) : (
          <YouTube />
        )}
      </ListItemIcon>
      <ListItemText>
        <div>
          <Typography>{stream.title}</Typography>
          <Typography color="textDisabled">{`${stream.platform} - ${stream.url}`}</Typography>
        </div>
        {myStatus?.lifeCycleStatus !== "complete" && (myStatus?.streamHealth?.length ?? 0) > 0 && (
          <Alert severity="warning" sx={{ mr: 8 }}>{myStatus!.streamHealth!.join("; ")}</Alert>
        )}
      </ListItemText>
    </ListItem>
  );
};

export const LiveStreamRowMemo = memo(LiveStreamRow);
