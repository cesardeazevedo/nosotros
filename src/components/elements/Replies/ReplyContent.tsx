import { ContentProvider } from '@/components/providers/ContentProvider'
import type { NoteState } from '@/hooks/state/useNote'
import type { CustomNode } from '@/nostr/types'
import { Content } from 'components/elements/Content/Content'
import type { ReactNode } from 'react'
import React, { memo } from 'react'
import { BubbleContainer } from '../Content/Layout/Bubble'
import { LinkNEvent } from '../Links/LinkNEvent'
import type { Props as PostContentWrapperProps } from '../Posts/PostContentWrapper'
import { PostContentWrapper } from '../Posts/PostContentWrapper'
import { PostCountdown } from '../Posts/PostCountdown'
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
  'mediaGroup',
] as CustomNode['type'][]

export const ReplyContent = memo(function ReplyContent(props: Props) {
  const { note, size, highlight } = props
  return (
    <PostContentWrapper expanded={note.state.contentOpen} onExpand={() => note.actions.toggleContent(true)} size={size}>
      <PostCountdown dense id={note.id} />
      <Content
        children={(index) => index === 0 && <ReplyUserHeader />}
        wrapper={(node) =>
          NonBubbleNodes.includes(node.type) ||
          (node.type === 'paragraph' && node.content?.length === 1 && node.content[0].type === 'hardBreak') // removes empty paragraphs
            ? React.Fragment
            : (props: { children: ReactNode }) => (
                <LinkNEvent nevent={note.nip19}>
                  <ContentProvider value={{ disableLink: false }}>
                    <BubbleContainer highlight={highlight}>{props.children}</BubbleContainer>
                  </ContentProvider>
                </LinkNEvent>
              )
        }
      />
    </PostContentWrapper>
  )
})
