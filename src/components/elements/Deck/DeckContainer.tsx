import { styled } from '@mui/material'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'
import React from 'react'

type Props = {
  children: React.ReactNode | React.ReactNode[]
}

const Container = styled('div')({
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
})

const DeckContainer = observer(function DeckContainer(props: Props) {
  const store = useStore()
  const Wrapper = store.deck.enabled ? Container : React.Fragment
  return <Wrapper>{props.children}</Wrapper>
})

export default DeckContainer
