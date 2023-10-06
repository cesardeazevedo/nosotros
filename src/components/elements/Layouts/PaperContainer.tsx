import { Paper } from '@mui/material'
import { SxProps, styled } from '@mui/material/styles'

const PaperContainer = styled(Paper)(({ theme }) => {
  const compactStyle: SxProps = {
    mb: 0,
    borderRadius: 0,
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    boxShadow: 'none',
    backgroundImage: 'none',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white,
  }
  return theme.unstable_sx({
    mb: 2,
    overflowX: 'hidden',
    [theme.breakpoints.down('sm')]: compactStyle,
    'html.deck &': compactStyle,
  })
})

export default PaperContainer
