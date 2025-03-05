import { Tooltip, Typography } from "@mui/material";
import { getPrettyDateTime, getRelativeTime } from "./util";

const Timestamp = ({
  timestamp,
  relative,
  fontColor,
}: {
  timestamp: string;
  relative: boolean;
  fontColor?: string;
}) => {
  if (relative) {
    return (
      <Tooltip title={getPrettyDateTime(timestamp)}>
        <Typography display="inline" sx={{ color: fontColor }}>
          {getRelativeTime(timestamp)}
        </Typography>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title={getRelativeTime(timestamp)}>
        <Typography display="inline" sx={{ color: fontColor }}>
          {getPrettyDateTime(timestamp)}
        </Typography>
      </Tooltip>
    );
  }
};

export default Timestamp;
