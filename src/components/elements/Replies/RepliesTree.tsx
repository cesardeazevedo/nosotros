import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { memo } from 'react'
import { Reply } from './Reply'

export const RepliesTree = memo(function RepliesTree(props: {
  repliesOpen: boolean | null
  replies: NostrEventDB[]
  level: number
  nested?: boolean
}) {
  const { replies, ...rest } = props
  return replies.map((event) => <Reply key={event.id} event={event} {...rest} />)
})
