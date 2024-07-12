import { Link, type LinkProps } from '@mui/material'
import { useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
import type Note from 'stores/models/note'

interface Props extends Omit<LinkProps, 'color'> {
  note: Note
  children: React.ReactNode
}

const LinkNEvent = observer(function LinkNEvent(props: Props) {
  const router = useRouter()

  const { note, ...rest } = props

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      if (e.metaKey || e.ctrlKey) {
        window.open(`/${note.nevent}`, '_blank')
      } else {
        router.navigate({
          to: `/$nostr`,
          params: { nostr: note.nevent },
          // TODO: check this later
          // state: { from: router.latestLocation.pathname },
        })
      }
      return true
    },
    [router, note],
  )

  return (
    <Link component='span' onClick={handleClick} sx={{ cursor: 'pointer' }} {...rest}>
      {props.children}
    </Link>
  )
})

export default LinkNEvent
