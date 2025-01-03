import type { Repost } from '@/stores/reposts/repost'
import { observer } from 'mobx-react-lite'
import { PostRoot } from '../Posts/Post'
import { PostLoading } from '../Posts/PostLoading'
import { RepostHeader } from './RepostHeader'

type Props = {
  repost: Repost
}

export const RepostRoot = observer(function RepostRoot(props: Props) {
  const { repost } = props
  const note = repost.note
  return note ? <PostRoot note={note} header={<RepostHeader repost={repost} />} /> : <PostLoading />
})
