import { Container, styled } from '@mui/material'

export const CenteredContainer = styled(Container)(({ theme }) =>
  theme.unstable_sx({
    p: 0,
    pt: 2,
    mb: 0,
    px: '0px!important',
    [theme.breakpoints.down('sm')]: {
      pt: 0,
    },
  }),
)
