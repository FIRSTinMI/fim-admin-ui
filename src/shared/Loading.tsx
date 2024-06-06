import { Box, CircularProgress } from "@mui/material"

export const Loading = ({ isLoading }: { isLoading?: boolean }) => {
  if (isLoading === undefined || isLoading === true) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <CircularProgress sx={{ mr: 2 }} /> Loading...
    </Box>
  )
}