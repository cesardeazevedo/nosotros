import { Kind } from '@/constants/kinds'
import type { Note } from '@/stores/notes/note'
import { Repost } from '@/stores/reposts/repost'
import { observer } from 'mobx-react-lite'
import { PostRoot } from '../Posts/Post'
import { PostThread } from '../Posts/PostThread'
import { RepostRoot } from '../Repost/Repost'

type Props = {
  item: Note | Repost
}

export const FeedItem = observer((props: Props) => {
  const { item } = props
  if (item instanceof Repost) {
    return <RepostRoot repost={item} />
  } else if (!item.metadata.isRoot && item.event.kind === Kind.Text) {
    return <PostThread note={item} />
  }
  return <PostRoot note={item} />
})
