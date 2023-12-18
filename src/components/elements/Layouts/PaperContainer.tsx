import { Paper, SxProps, Theme, styled } from '@mui/material'

const PaperContainer = styled(Paper)(({ theme }: { theme: Theme }) => {
  const compactStyle: SxProps = {
    marginBottom: 0,
    borderRadius: 0,
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    boxShadow: 'none',
    backgroundImage: 'none',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white,
  }
  return {
    marginBottom: 16,
    overflowX: 'hidden',
    [theme.breakpoints.down('sm')]: compactStyle,
    'html.deck &': compactStyle,
  }
})

export default PaperContainer
