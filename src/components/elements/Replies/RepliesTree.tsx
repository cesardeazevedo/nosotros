import type { Event } from '@/stores/events/event'
import { observer } from 'mobx-react-lite'
import { Reply } from './Reply'

export const RepliesTree = observer(function RepliesTree(props: {
  repliesOpen: boolean | null
  replies: Event[]
  level: number
  nested?: boolean
}) {
  const { replies, ...rest } = props
  return replies.map((event) => <Reply key={event.id} event={event.event} {...rest} />)
})
