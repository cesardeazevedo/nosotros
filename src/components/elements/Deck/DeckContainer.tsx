import { Box, styled } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useStore } from 'stores'

type Props = {
  children: React.ReactNode | React.ReactNode[]
}

const Container = styled(Box)(({ theme }) =>
  theme.unstable_sx({
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    overflowY: 'hidden',
    overflowX: 'auto',
    '> div': {
      width: 550,
      margin: 0,
      padding: 0,
      borderRight: '4px solid var(--mui-palette-divider)',
      height: '100%',
      overflow: 'auto',
    },
  }),
)

const DeckContainer = observer(function DeckContainer(props: Props) {
  const store = useStore()
  const Wrapper = store.deck.enabled ? Container : React.Fragment
  return <Wrapper>{props.children}</Wrapper>
})

export default DeckContainer
