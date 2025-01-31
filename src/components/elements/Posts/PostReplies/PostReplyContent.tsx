import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
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
  size?: PostContentWrapperProps['size']
}

const NonBubbleNodes = [
  'image',
  'video',
  'youtube',
  'nevent',
  'naddr',
  'bolt11',
  'tweet',
  'codeBlock',
] as Node['type'][]

export const ReplyUserHeader = observer(function ReplyUserHeader() {
  const { note } = useNoteContext()
  return (
    <Stack horizontal={false}>
      <Stack gap={1} align='center'>
        <UserName pubkey={note.event.pubkey} />
        <UserHeaderDate nevent={note.event.nevent} date={note.event.event.created_at} />
      </Stack>
      <UserNIP05 pubkey={note.event.pubkey} />
    </Stack>
  )
})

export const PostReplyContent = observer(function PostReplyContent(props: Props) {
  const { size } = props
  return (
    <PostContentWrapper bubble size={size}>
      <Content
        bubble
        children={(index) => index === 0 && <ReplyUserHeader />}
        wrapper={(node) => (NonBubbleNodes.includes(node.type) ? React.Fragment : BubbleContainer)}
      />
    </PostContentWrapper>
  )
})
