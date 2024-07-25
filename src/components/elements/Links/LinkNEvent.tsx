import { type LinkProps } from '@mui/material'
import { useMatch } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useContext } from 'react'
import type Note from 'stores/models/note'
import { deckStore } from 'stores/ui/deck.store'
import LinkRouter from './LinkRouter'
import { DeckContext } from '../Deck/DeckList'

interface Props extends Omit<LinkProps, 'ref'> {
  note: Note
  component?: LinkProps['component']
  children: React.ReactNode
  disableLink?: boolean
}

const LinkNEvent = observer(function LinkNEvent(props: Props) {
  const { note, disableLink, ...rest } = props
  const route = useMatch({ strict: false })
  const isDeck = route.id === '/deck'
  const { index } = useContext(DeckContext)

  const handleClickDeck = useCallback(() => {
    if (note) {
      deckStore.addNoteColumn({ noteId: note.id }, index + 1)
    }
  }, [note, index])

  if (disableLink) {
    return props.children
  }

  if (isDeck) {
    return (
      <LinkRouter onClick={handleClickDeck} sx={{ cursor: 'pointer' }} {...rest}>
        {props.children}
      </LinkRouter>
    )
  }

  return (
    <LinkRouter to='/$nostr' params={{ nostr: note.nevent }} sx={{ cursor: 'pointer' }} {...rest}>
      {props.children}
    </LinkRouter>
  )
})

export default LinkNEvent
