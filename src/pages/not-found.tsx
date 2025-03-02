import { Alert, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTitle } from "src/hooks/useTitle.ts";

function NotFound() {
  useTitle("Not Found")
  return (
    <Alert severity="error">
      <strong>Oh no!</strong> You've reached a page that doesn't exist.
      Try going <Link to="/events" component={RouterLink}>somewhere else</Link>.
    </Alert>
  );
}

export default NotFound;