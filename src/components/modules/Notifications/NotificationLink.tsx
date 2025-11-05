import { LinkNEvent } from '@/components/elements/Links/LinkNEvent'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NoteState } from '@/hooks/state/useNote'
import { useNevent } from '@/hooks/useEventUtils'
import type { ReactNode } from 'react'
import type { NotificationType } from './NotificationItem'

type Props = {
  note: NoteState
  related?: NostrEventDB
  type: NotificationType
  children: ReactNode
}

export const NotificationLink = (props: Props) => {
  const nevent = useNevent(props.note.event)
  const relatedNevent = useNevent(props.related)
  const { type } = props
  switch (type) {
    case 'reply':
    case 'mention':
      return <LinkNEvent nevent={nevent}>{props.children}</LinkNEvent>
    case 'zap_profile':
    case 'public_message': {
      return props.children
    }
    default: {
      if (props.related) {
        return <LinkNEvent nevent={relatedNevent}>{props.children}</LinkNEvent>
      }
      return props.children
    }
  }
}
