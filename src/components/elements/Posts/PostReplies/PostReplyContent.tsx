import { Stack } from '@/components/ui/Stack/Stack'
import { Content } from 'components/elements/Content/Content'
import { UserHeaderDate } from 'components/elements/User/UserHeader'
import UserName from 'components/elements/User/UserName'
import { observer } from 'mobx-react-lite'
import type Note from 'stores/models/note'
import { userStore } from 'stores/nostr/users.store'
import PostContentWrapper from '../PostContentWrapper'

type Props = {
  note: Note
}

export const ReplyUserHeader = observer((props: { note: Note }) => {
  const user = userStore.get(props.note.event?.pubkey)
  return (
    <Stack gap={1}>
      <UserName user={user} />
      <UserHeaderDate note={props.note} />
    </Stack>
  )
})

const PostReplyContent = observer(function PostReplyContent(props: Props) {
  const { note } = props
  return (
    <PostContentWrapper bubble note={note}>
      <Content dense bubble note={note} header={<ReplyUserHeader note={note} />} />
    </PostContentWrapper>
  )
})

export default PostReplyContent
