import { useDeckAddNextColumn } from '@/components/modules/Deck/hooks/useDeck'
import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { createEventModule } from '@/hooks/modules/createEventModule'
import { useNostrMaskedLinkProps } from '@/hooks/useNostrMasedLinkProps'
import { decodeNIP19 } from '@/utils/nip19'
import type { LinkProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'
import { nip19 } from 'nostr-tools'
import type { NEvent, Note } from 'nostr-tools/nip19'
import type { DragEventHandler } from 'react'
import React, { memo, useMemo } from 'react'
import { css } from 'react-strict-dom'

export type Props = {
  nevent?: NEvent | Note | string | undefined
  search?: LinkProps['search']
  underline?: boolean
  children: React.ReactNode
  sx?: SxProps
}

export const LinkNEvent = memo(function LinkNEvent(props: Props) {
  const { underline, nevent: neventProp, search, sx, ...rest } = props
  const { disableLink } = useContentContext()

  const router = useRouter()
  const style = [styles.cursor, underline && styles.underline, sx]

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

  const linkMaskedProps = useNostrMaskedLinkProps(nevent)

  const deck = useDeckAddNextColumn(() => createEventModule(nevent))

  const handleDragStart: DragEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  if (disableLink || !nevent) {
    return props.children
  }

  if (deck.isDeck) {
    return (
      <a
        onClick={deck.add}
        {...rest}
        {...css.props([style, underline && styles.underline])}
        onDragStart={handleDragStart}>
        {props.children}
      </a>
    )
  }

  return (
    <Link
      state={{ from: router.latestLocation.pathname } as never}
      {...linkMaskedProps}
      {...rest}
      {...css.props(style)}
      onClick={(e) => e.stopPropagation()}
      onDragStart={handleDragStart}>
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
