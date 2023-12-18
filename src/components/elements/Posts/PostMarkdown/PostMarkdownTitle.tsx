import { Typography, styled } from '@mui/material'

export const PostMarkdownTitle = styled(Typography)(({ theme }) =>
  theme.unstable_sx({
    mt: 2,
    ml: 2,
    fontWeight: 900,
  }),
)
