import { useDeckAddNextColumn } from '@/components/modules/Deck/hooks/useDeck'
import { useContentContext } from '@/components/providers/ContentProvider'
import { createEventModule } from '@/hooks/modules/createEventModule'
import { decodeNIP19 } from '@/utils/nip19'
import { Link, useRouter } from '@tanstack/react-router'
import { nip19 } from 'nostr-tools'
import type { NEvent, Note } from 'nostr-tools/nip19'
import React, { memo, useMemo } from 'react'
import { css, html } from 'react-strict-dom'

export type Props = {
  nevent?: NEvent | Note | string | undefined
  children: React.ReactNode
  underline?: boolean
}

export const LinkNEvent = memo(function LinkNEvent(props: Props) {
  const { underline, nevent: neventProp, ...rest } = props
  const { disableLink } = useContentContext()

  const router = useRouter()

  // Swap note1 to nevent as note1 was deprecated
  const nevent = useMemo(() => {
    if (neventProp) {
      const isNote1 = neventProp.startsWith('note1') || neventProp.startsWith('nostr:note1')
      if (isNote1) {
        const decoded = decodeNIP19(neventProp)
        if (decoded && decoded.type === 'note') {
          const encoded = nip19.neventEncode({
            id: decoded.data,
            relays: [],
          })
          return encoded
        }
      }
      return neventProp
    }
  }, [neventProp])

  const deck = useDeckAddNextColumn(() => createEventModule(nevent))

  if (disableLink || !nevent) {
    return props.children
  }

  if (deck.isDeck) {
    return (
      <html.a onClick={deck.add} {...rest} style={[styles.cursor, underline && styles.underline]}>
        {props.children}
      </html.a>
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
