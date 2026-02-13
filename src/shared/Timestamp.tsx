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
        <Typography component="span" display="inline" sx={{ color: fontColor, whiteSpace: "nowrap" }}>
          {getRelativeTime(timestamp)}
        </Typography>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title={getRelativeTime(timestamp)}>
        <Typography component="span" display="inline" sx={{ color: fontColor, whiteSpace: "nowrap" }}>
          {getPrettyDateTime(timestamp)}
        </Typography>
      </Tooltip>
    );
  }
};

export default Timestamp;
