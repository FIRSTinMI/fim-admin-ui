import { Box, CircularProgress } from "@mui/material"

export const Loading = ({ isLoading, text = "Loading...", justifyContent = "center" }: { isLoading?: boolean, text?: string, justifyContent?: "left" | "center" }) => {
  if (isLoading === undefined || isLoading === true) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent, width: '100%' }}>
      <CircularProgress sx={{ mr: 2 }} /> {text}
    </Box>
  )
}