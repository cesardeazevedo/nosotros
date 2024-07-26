import { styled } from '@mui/material'

export const DeckContainer = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  height: '100%',
  overflowX: 'auto',
  overflowY: 'hidden',
  marginLeft: 75,
  '> div': {
    minWidth: 550,
    margin: 0,
    padding: 0,
    borderRight: '1px solid var(--mui-palette-divider)',
    height: '100%',
    overflow: 'auto',
  },
})

export default DeckContainer
