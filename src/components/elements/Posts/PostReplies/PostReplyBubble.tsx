import { Box, styled } from '@mui/material'

const Bubble = styled(Box)(({ theme }) =>
  theme.unstable_sx({
    px: 1.5,
    pt: 0.2,
    pb: 0.6,
    borderRadius: 1.5,
    backgroundColor: 'var(--mui-palette-FilledInput-bg)',
    display: 'inline-block',
  }),
)

export default Bubble
