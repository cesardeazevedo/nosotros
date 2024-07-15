import { type LinkProps } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React from 'react'
import type Note from 'stores/models/note'
import LinkRouter from './LinkRouter'

interface Props extends Omit<LinkProps, 'ref'> {
  note: Note
  component?: LinkProps['component']
  children: React.ReactNode
  disableLink?: boolean
}

const LinkNEvent = observer(function LinkNEvent(props: Props) {
  const { note, disableLink, ...rest } = props

  if (disableLink) {
    return props.children
  }

  return (
    <LinkRouter to='/$nostr' params={{ nostr: note.nevent }} sx={{ cursor: 'pointer' }} {...rest}>
      {props.children}
    </LinkRouter>
  )
})

export default LinkNEvent
