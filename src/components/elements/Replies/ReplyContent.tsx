import { Content } from 'components/elements/Content/Content'
import { observer } from 'mobx-react-lite'
import type { Node } from 'nostr-editor'
import React from 'react'
import { BubbleContainer } from '../Content/Layout/Bubble'
import type { Props as PostContentWrapperProps } from '../Posts/PostContentWrapper'
import { PostContentWrapper } from '../Posts/PostContentWrapper'
import { ReplyUserHeader } from './ReplyUserHeader'

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

export const ReplyContent = observer(function ReplyContent(props: Props) {
  const { size } = props
  return (
    <PostContentWrapper bubble size={size}>
      <Content
        children={(index) => index === 0 && <ReplyUserHeader />}
        wrapper={(node) =>
          NonBubbleNodes.includes(node.type) ||
          (node.type === 'paragraph' && node.content?.length === 1 && node.content[0].type === 'hardBreak') // removes empty paragraphs
            ? React.Fragment
            : BubbleContainer
        }
      />
    </PostContentWrapper>
  )
})
