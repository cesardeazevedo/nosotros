import { Stack } from '@/components/ui/Stack/Stack'
import type { Comment } from '@/stores/comment/comment'
import type { Note } from '@/stores/notes/note'
import { Content } from 'components/elements/Content/Content'
import { UserName } from 'components/elements/User/UserName'
import { observer } from 'mobx-react-lite'
import type { Node } from 'nostr-editor'
import React from 'react'
import { BubbleContainer } from '../../Content/Layout/Bubble'
import { UserHeaderDate } from '../../User/UserHeaderDate'
import { UserNIP05 } from '../../User/UserNIP05'
import type { Props as PostContentWrapperProps } from '../PostContentWrapper'
import { PostContentWrapper } from '../PostContentWrapper'

type Props = {
  note: Note | Comment
  size?: PostContentWrapperProps['size']
}

const NonBubbleNodes = [
  'image',
  'video',
  'youtube',
  'nevent',
  'bolt11',
  'naddr',
  'bolt11',
  'tweet',
  'codeBlock',
] as Node['type'][]

export const ReplyUserHeader = observer(function ReplyUserHeader(props: { note: Props['note'] }) {
  const { note } = props
  return (
    <Stack horizontal={false}>
      <Stack gap={1} align='center'>
        <UserName pubkey={note.event.pubkey} />
        <UserHeaderDate nevent={note.nevent} date={note.event.created_at} />
      </Stack>
      <UserNIP05 pubkey={note.event.pubkey} />
    </Stack>
  )
})

export const PostReplyContent = observer(function PostReplyContent(props: Props) {
  const { note, size } = props
  return (
    <PostContentWrapper bubble note={note} size={size}>
      <Content
        bubble
        note={note}
        children={(index) => index === 0 && <ReplyUserHeader note={note} />}
        wrapper={(node) => (NonBubbleNodes.includes(node.type) ? React.Fragment : BubbleContainer)}
      />
    </PostContentWrapper>
  )
})
