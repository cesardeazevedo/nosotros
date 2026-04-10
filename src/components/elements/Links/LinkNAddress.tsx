import { useContentContext } from '@/components/providers/ContentProvider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { createEventModule } from '@/hooks/modules/createEventModule'
import { useNaddress } from '@/hooks/useEventUtils'
import { useNostrMaskedLinkProps, useNostrNavigationScope } from '@/hooks/useNostrMaskedLinkProps'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'

export type Props = {
  event?: NostrEventDB
  children: React.ReactNode
  underline?: boolean
}

export const LinkNAddress = memo(function LinkNAddress(props: Props) {
  const { event, underline, ...rest } = props
  const { disableLink } = useContentContext()

  const naddress = useNaddress(event)
  const router = useRouter()
  const navigate = useNavigate()
  const scope = useNostrNavigationScope()
  const linkMaskedProps = useNostrMaskedLinkProps(naddress, scope)
  const columnLinkProps = useNostrMaskedLinkProps(naddress, 'column')

  if (disableLink || !naddress) {
    return props.children
  }

  return (
    <Link
      {...linkMaskedProps}
      state={{ from: router.latestLocation.pathname, scope } as never}
      {...rest}
      {...css.props([styles.cursor, underline && styles.underline])}
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
