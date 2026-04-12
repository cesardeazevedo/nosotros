import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NoteState } from '@/hooks/state/useNote'
import { useNevent } from '@/hooks/useEventUtils'
import { Link, useRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { NotificationType } from './NotificationItem'

type Props = {
  note: NoteState
  related?: NostrEventDB
  type: NotificationType
  children: ReactNode
}

export const NotificationLink = (props: Props) => {
  const router = useRouter()
  const nevent = useNevent(props.note.event)
  const relatedNevent = useNevent(props.related)
  const { type } = props
  switch (type) {
    case 'reply':
    case 'mention':
      if (!nevent) {
        return props.children
      }
      return (
        <Link
          to='.'
          search={(s) => ({ ...s, nostr: undefined, column: nevent, column_size: 'sm' })}
          mask={{ to: '/$nostr', params: { nostr: nevent }, unmaskOnReload: true }}
          state={{ from: router.latestLocation.pathname, scope: 'column' } as never}
          onClick={(e) => e.stopPropagation()}>
          {props.children}
        </Link>
      )
    case 'zap_profile':
    case 'public_message': {
      return props.children
    }
    default: {
      if (props.related) {
        if (!relatedNevent) {
          return props.children
        }
        return (
          <Link
            to='.'
            search={(s) => ({ ...s, nostr: undefined, column: relatedNevent, column_size: 'sm' })}
            mask={{ to: '/$nostr', params: { nostr: relatedNevent }, unmaskOnReload: true }}
            state={{ from: router.latestLocation.pathname, scope: 'column' } as never}
            onClick={(e) => e.stopPropagation()}>
            {props.children}
          </Link>
        )
      }
      return props.children
    }
  }
}
