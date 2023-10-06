import { Box, Typography, TypographyProps } from '@mui/material'

function ComingSoon(props: { variant?: TypographyProps['variant'] }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s ease-in-out',
        opacity: 0,
        backgroundColor: 'transparent',
        color: 'transparent',
        '&:hover': {
          opacity: 0.88,
          color: 'inherit',
          backgroundColor: 'var(--mui-palette-AppBar-defaultBg)',
        },
      }}>
      <Typography variant={props.variant || 'h6'} fontWeight={600}>
        Coming Soon
      </Typography>
    </Box>
  )
}

export default ComingSoon
