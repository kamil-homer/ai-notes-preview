import { Typography } from '@mui/material'

export const AppTitle = ({ variant = 'h4', component = 'h1', sx = {}, ...props }) => {
  return (
    <Typography 
      variant={variant}
      component={component}
      sx={{
        fontWeight: 400,
        textAlign: 'center',
        color: 'primary.main',
        ...sx
      }}
      {...props}
    >
      AI Notes
    </Typography>
  )
}
