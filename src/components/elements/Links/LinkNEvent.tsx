import { useRootStore } from '@/hooks/useRootStore'
import { seenStore } from '@/stores/seen/seen.store'
import { decodeNIP19 } from '@/utils/nip19'
import { Link, useRouter } from '@tanstack/react-router'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import type { NEvent, Note } from 'nostr-tools/nip19'
import React, { useCallback, useContext } from 'react'
import { css } from 'react-strict-dom'
import { DeckContext } from '../Deck/DeckContext'

export type Props = {
  nevent?: NEvent | Note
  children: React.ReactNode
  underline?: boolean
  disableLink?: boolean
}

export const LinkNEvent = observer(function LinkNEvent(props: Props) {
  const { disableLink, underline, ...rest } = props
  const router = useRouter()
  const root = useRootStore()
  const { index } = useContext(DeckContext)

  // Some quotes might be note1
  const nevent = useLocalObservable(() => ({
    get value() {
      const { nevent } = props
      if (nevent && nevent.startsWith('note1') && nevent.startsWith('nostr:note1')) {
        const decoded = decodeNIP19(nevent)
        if (decoded?.type === 'note') {
          return nip19.neventEncode({
            id: decoded.data,
            relays: seenStore.get(decoded.data),
          })
        }
      }
      return nevent
    },
  })).value

  const handleClickDeck = useCallback(() => {
    if (nevent) {
      const decoded = decodeNIP19(nevent)
      switch (decoded?.type) {
        case 'nevent': {
          root.decks.selected.addNEvent({ options: decoded.data }, (index || 0) + 1)
          break
        }
        case 'note': {
          const options = { id: decoded.data, relays: seenStore.get(decoded.data) }
          root.decks.selected.addNEvent({ options }, (index || 0) + 1)
          break
        }
      }
    }
  }, [nevent, index])

  if (disableLink || !nevent) {
    return props.children
  }

  if (index !== undefined) {
    return (
      <Link onClick={handleClickDeck} {...rest} {...css.props([underline && styles.underline])}>
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
