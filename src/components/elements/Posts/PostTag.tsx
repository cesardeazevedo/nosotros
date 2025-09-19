import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventFirstTopicCurrentUserFollows } from '@/hooks/useEventUtils'
import { Tag } from '../Content/Tag/Tag'

type Props = {
  event: NostrEventDB
}

// relevant tags of a post
export const PostTag = (props: Props) => {
  const { event } = props
  const tag = useEventFirstTopicCurrentUserFollows(event)
  if (!tag) {
    return
  }
  return <Tag tag={tag}>#{tag}</Tag>
}
