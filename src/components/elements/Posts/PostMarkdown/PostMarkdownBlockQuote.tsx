import { styled } from '@mui/material'

export const PostMarkdownBlockQuote = styled('div')(({ theme }) =>
  theme.unstable_sx({
    ml: 2,
    my: 4,
    px: 2,
    py: 1,
    borderLeft: '6px solid',
    borderColor: 'divider',
    fontStyle: 'italic',
    color: 'text.secondary',
  }),
)
