import { useDeckAddNextColumn } from '@/components/modules/Deck/hooks/useDeck'
import { useContentContext } from '@/components/providers/ContentProvider'
import { createEventModule } from '@/hooks/modules/createEventModule'
import { Link, useRouter } from '@tanstack/react-router'
import type { NAddr } from 'nostr-tools/nip19'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'

export type Props = {
  naddress: NAddr | undefined
  children: React.ReactNode
  underline?: boolean
}

export const LinkNAddress = memo(function LinkNAddress(props: Props) {
  const { naddress, underline, ...rest } = props
  const { disableLink } = useContentContext()

  const router = useRouter()
  const deck = useDeckAddNextColumn(() => createEventModule(naddress))

  if (disableLink || !naddress) {
    return props.children
  }

  if (deck.isDeck) {
    return (
      <html.a onClick={deck.add} {...rest} {...css.props([styles.cursor, underline && styles.underline])}>
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
      params={{ nostr: naddress }}>
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
