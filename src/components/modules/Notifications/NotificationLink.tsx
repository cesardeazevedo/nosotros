import { LinkNEvent } from '@/components/elements/Links/LinkNEvent'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NoteState } from '@/hooks/state/useNote'
import { useNevent } from '@/hooks/useEventUtils'
import type { ReactNode } from 'react'
import type { NotificationType } from './NotificationItem'

const NotificationLinkInner = (props: Required<Props>) => {
  const { type, note, related } = props
  const relatedNevent = useNevent(related)
  const linkNevent = type === 'reply' || type === 'mention' ? note.nip19 : relatedNevent
  return <LinkNEvent nevent={linkNevent}>{props.children}</LinkNEvent>
}

type Props = {
  note: NoteState
  related?: NostrEventDB
  type: NotificationType
  children: ReactNode
}

export const NotificationLink = (props: Props) => {
  const { type } = props
  if (type !== 'public_message') {
    return props.related ? <NotificationLinkInner {...props} related={props.related} /> : props.children
  }
  return props.children
}
