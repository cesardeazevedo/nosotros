import type { NoteState } from '@/hooks/state/useNote'
import { Content } from 'components/elements/Content/Content'
import type { Node } from 'nostr-editor'
import type { ReactNode } from 'react'
import React, { memo } from 'react'
import { BubbleContainer } from '../Content/Layout/Bubble'
import type { Props as PostContentWrapperProps } from '../Posts/PostContentWrapper'
import { PostContentWrapper } from '../Posts/PostContentWrapper'
import { ReplyUserHeader } from './ReplyUserHeader'

type Props = {
  note: NoteState
  highlight?: boolean
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

export const ReplyContent = memo(function ReplyContent(props: Props) {
  const { note, size, highlight } = props
  return (
    <PostContentWrapper note={note} size={size}>
      <Content
        children={(index) => index === 0 && <ReplyUserHeader />}
        wrapper={(node) =>
          NonBubbleNodes.includes(node.type) ||
          (node.type === 'paragraph' && node.content?.length === 1 && node.content[0].type === 'hardBreak') // removes empty paragraphs
            ? React.Fragment
            : (props: { children: ReactNode }) => (
                <BubbleContainer highlight={highlight}>{props.children}</BubbleContainer>
              )
        }
      />
    </PostContentWrapper>
  )
})
