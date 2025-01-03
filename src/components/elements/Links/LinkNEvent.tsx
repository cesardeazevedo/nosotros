import { useRootStore } from '@/hooks/useRootStore'
import { decodeNIP19 } from '@/utils/nip19'
import { Link, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import type { NEvent } from 'nostr-tools/nip19'
import React, { useCallback, useContext } from 'react'
import { css } from 'react-strict-dom'
import { DeckContext } from '../Deck/DeckContext'

export type Props = {
  nevent?: NEvent
  children: React.ReactNode
  underline?: boolean
  disableLink?: boolean
}

export const LinkNEvent = observer(function LinkNEvent(props: Props) {
  const { nevent, disableLink, underline, ...rest } = props
  const router = useRouter()
  const root = useRootStore()
  const { index } = useContext(DeckContext)

  const handleClickDeck = useCallback(() => {
    if (nevent) {
      const decoded = decodeNIP19(nevent)
      if (decoded?.type === 'nevent') {
        root.decks.selected.addNEvent({ options: decoded.data }, (index || 0) + 1)
      }
    }
  }, [nevent, index])

  if (disableLink || !nevent) {
    return props.children
  }

  if (index !== undefined) {
    return (
      <Link onClick={handleClickDeck} {...rest}>
        {props.children}
      </Link>
    )
  }

  return (
    <Link
      to={`/$nostr`}
      // @ts-ignore
      state={{ from: router.latestLocation.pathname }}
      {...rest}
      {...css.props([underline && styles.underline])}
      params={{ nostr: nevent }}>
      {props.children}
    </Link>
  )
})

const styles = css.create({
  underline: {
    textDecoration: {
      default: 'inherit',
      ':hover': 'underline',
    },
  },
})
