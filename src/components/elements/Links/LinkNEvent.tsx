import { useContentContext } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNevent } from '@/hooks/useEventUtils'
import { useNostrMaskedLinkProps, useNostrNavigationScope } from '@/hooks/useNostrMaskedLinkProps'
import { decodeNIP19 } from '@/utils/nip19'
import type { LinkProps } from '@tanstack/react-router'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { nip19 } from 'nostr-tools'
import type { NEvent, Note } from 'nostr-tools/nip19'
import React, { memo, useMemo } from 'react'
import { css } from 'react-strict-dom'

export type Props = {
  event?: NostrEventDB
  search?: LinkProps['search']
  underline?: boolean
  children: React.ReactNode
  sx?: SxProps
}

export type ExternalProps = {
  nevent?: NEvent | Note | string | undefined
  search?: LinkProps['search']
  underline?: boolean
  children: React.ReactNode
  sx?: SxProps
}

function LinkNEventBase(props: ExternalProps) {
  const { underline, nevent: neventProp, sx, ...rest } = props
  const { disableLink } = useContentContext()

  const router = useRouter()
  const navigate = useNavigate()
  const scope = useNostrNavigationScope()
  const style = [styles.cursor, underline && styles.underline, sx]

  const nevent = useMemo(() => {
    if (!neventProp) {
      return
    }

    const isNote1 = neventProp.startsWith('note1') || neventProp.startsWith('nostr:note1')
    if (!isNote1) {
      return neventProp
    }

    const decoded = decodeNIP19(neventProp)
    if (decoded?.type === 'note') {
      return nip19.neventEncode({
        id: decoded.data,
        relays: [],
      })
    }

    return neventProp
  }, [neventProp])

  const linkMaskedProps = useNostrMaskedLinkProps(nevent, scope)
  const columnLinkProps = useNostrMaskedLinkProps(nevent, 'column')

  if (disableLink || !nevent) {
    return props.children
  }

  return (
    <Link
      state={{ from: router.latestLocation.pathname, scope } as never}
      {...linkMaskedProps}
      {...rest}
      {...css.props(style)}
      onClick={(e) => {
        e.stopPropagation()

        if (e.shiftKey) {
          e.preventDefault()
          navigate({
            ...columnLinkProps,
            state: { from: router.latestLocation.pathname, scope: 'column' } as never,
          } as never)
          return
        }
      }}>
      {props.children}
    </Link>
  )
}

export const LinkNEvent = memo(function LinkNEvent(props: Props) {
  const { event, ...rest } = props
  const nevent = useNevent(event)
  return (
    <LinkNEventBase nevent={nevent} {...rest}>
      {props.children}
    </LinkNEventBase>
  )
})

export const LinkNEventExternal = memo(function LinkNEventExternal(props: ExternalProps) {
  return <LinkNEventBase {...props} />
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
