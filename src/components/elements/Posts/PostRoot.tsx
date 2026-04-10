import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { memo } from 'react'
import { PostContent } from './PostContent'
import { PostContentHidden } from './PostContentHidden'

type Props = {
  event: NostrEventDB
}

export const PostRoot = memo(function PostRoot(props: Props) {
  const { event } = props
  return (
    <PostContentHidden event={event}>
      <PostContent />
    </PostContentHidden>
  )
})
