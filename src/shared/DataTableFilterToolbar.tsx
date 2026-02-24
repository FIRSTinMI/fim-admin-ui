import { GridToolbarQuickFilter, Toolbar } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { JSX } from "react";

const DataTableFilterToolbar = ({ children }: {children?: JSX.Element}) => {
  return (
    <Toolbar>
      <Box sx={{ py: 1, px: 1, display: 'flex', justifyContent: children !== undefined ? 'space-between' : 'flex-end', width: '100%' }}>
        { children !== undefined ? children : <></> }
        <GridToolbarQuickFilter /> {/* TODO: Deprecated, replace */}
      </Box>
    </Toolbar>
  );
}

export default DataTableFilterToolbar;