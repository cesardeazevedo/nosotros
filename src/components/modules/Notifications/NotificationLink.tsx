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

const NotificationLinkInner = (props: Props) => {
  const { type, note, related } = props
  const relatedNevent = useNevent(related)
  const linkNevent = type === 'reply' || type === 'mention' ? note.nip19 : relatedNevent
  return <LinkNEvent nevent={linkNevent}>{props.children}</LinkNEvent>
}

export const NotificationLink = (props: Props) => {
  const { type } = props
  if (type !== 'public_message') {
    return <NotificationLinkInner {...props} />
  }
  return props.children
}
