import { Typography } from '@mui/material'

export const AppTitle = ({ variant = 'body1', color = 'primary.main', sx = {}}) => {
  return (
    <Typography variant={variant} color={color} sx={{textAlign: 'center', ...sx}}>
      AI Notes
    </Typography>
  )
}