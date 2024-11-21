import type { Repost } from '@/stores/models/repost'
import { observer } from 'mobx-react-lite'
import { RepostHeader } from './RepostHeader'
import { PostLoading } from '../Posts/PostLoading'
import { PostRoot } from '../Posts/Post'

type Props = {
  repost: Repost
}

export const RepostRoot = observer(function PostRepost(props: Props) {
  const { repost } = props
  const note = repost.note
  return note ? <PostRoot note={note} header={<RepostHeader repost={repost} />} /> : <PostLoading />
})
