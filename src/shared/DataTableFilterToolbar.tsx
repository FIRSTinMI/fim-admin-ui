import { GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { JSX } from "react";

const DataTableFilterToolbar = ({ children }: {children?: JSX.Element}) => {
  return (
    <Box sx={{ py: 1, px: 1, display: 'flex', justifyContent: children !== undefined ? 'space-between' : 'flex-end' }}>
      { children !== undefined ? children : <></> }
      <GridToolbarQuickFilter />
    </Box>
  );
}

export default DataTableFilterToolbar;