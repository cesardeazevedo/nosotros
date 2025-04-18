import { useContentContext } from '@/components/providers/ContentProvider'
import { useRootStore } from '@/hooks/useRootStore'
import { createNEventModule } from '@/stores/modules/module.helpers'
import { seenStore } from '@/stores/seen/seen.store'
import { decodeNIP19 } from '@/utils/nip19'
import { Link, useRouter } from '@tanstack/react-router'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import type { NEvent, Note } from 'nostr-tools/nip19'
import React, { useCallback, useContext } from 'react'
import { css } from 'react-strict-dom'
import { DeckContext } from '../../modules/Deck/DeckContext'

export type Props = {
  nevent?: NEvent | Note
  children: React.ReactNode
  underline?: boolean
  replaceOnDeck?: boolean
}

export const LinkNEvent = observer(function LinkNEvent(props: Props) {
  const { underline, replaceOnDeck = false, ...rest } = props
  const router = useRouter()
  const root = useRootStore()
  const { index } = useContext(DeckContext)
  const { disableLink } = useContentContext()
  const isDeck = index !== undefined

  // Some quotes might be note1
  const nevent = useLocalObservable(() => ({
    get value() {
      const { nevent } = props
      if (nevent && (nevent.startsWith('note1') || nevent.startsWith('nostr:note1'))) {
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
      if (decoded?.type === 'nevent') {
        root.decks.selected.add(createNEventModule(decoded.data), (index || 0) + 1, replaceOnDeck)
      }
    }
  }, [nevent, index])

  if (disableLink || !nevent) {
    return props.children
  }

  if (isDeck) {
    return (
      <a onClick={handleClickDeck} {...rest} {...css.props([styles.cursor, underline && styles.underline])}>
        {props.children}
      </a>
    )
  }

  return (
    <Link
      to={`/$nostr`}
      state={{ from: router.latestLocation.pathname } as never}
      {...rest}
      {...css.props([underline && styles.underline])}
      params={{ nostr: nevent }}>
      {props.children}
    </Link>
  )
})

const styles = css.create({
  cursor: {
    cursor: 'pointer',
  },
  underline: {
    textDecoration: {
      default: 'inherit',
      ':hover': 'underline',
    },
  },
})
