import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Kind } from '@/constants/kinds'
import { getMimeFromExtension } from '@/hooks/parsers/parseImeta'
import type { ImageNode, Node, VideoNode } from 'nostr-editor'
import React, { memo } from 'react'
import { Image } from './Image/Image'
import { MediaWrapper } from './Layout/MediaWrapper'
import { Paragraph } from './Layout/Paragraph'
import { LNInvoice } from './LNInvoice/LNInvoice'
import { BlockQuote } from './Markdown/BlockQuote'
import { CodeBlock } from './Markdown/CodeBlock'
import { Heading } from './Markdown/Heading'
import { List } from './Markdown/List'
import { NAddr } from './NAddr/NAddr'
import { NEvent } from './NEvent/NEvent'
import { Tweet } from './Tweet/Tweet'
import { Video } from './Video/Video'
import { YoutubeEmbed } from './Youtube/YoutubeEmbed'

type Props = {
  wrapper?: (node: Node) => React.ElementType
  children?: (index: number) => React.ReactNode
  renderMedia?: boolean
}

// Markdown videos are embbed as images, we need to figure out this in nostr-editor/tiptap-markdown
const isVideoNode = (kind: Kind, node: Node): node is VideoNode => {
  const type = kind === Kind.Article && node.type === 'image' ? getMimeFromExtension(node.attrs.src) : node.type
  return type === 'video'
}
const isImageNode = (kind: Kind, node: Node): node is ImageNode => {
  const type = kind === Kind.Article && node.type === 'image' ? getMimeFromExtension(node.attrs.src) : node.type
  return type === 'image'
}

export const Content = memo(function Content(props: Props) {
  const { wrapper, children, renderMedia = true } = props
  const { event } = useNoteContext()
  const { dense } = useContentContext()
  return (
    <>
      {event.metadata?.contentSchema?.content.map((node, index) => {
        const Wrapper = wrapper?.(node) || React.Fragment
        const size = dense ? 'md' : 'lg'
        return (
          <Wrapper key={node.type + index}>
            <>
              {children?.(index)}
              {node.type === 'heading' && <Heading node={node} />}
              {node.type === 'paragraph' && <Paragraph node={node} />}
              {renderMedia && isImageNode(event.kind, node) && (
                <>
                  <MediaWrapper size={size} src={node.attrs.src}>
                    <Image src={node.attrs!.src} />
                  </MediaWrapper>
                </>
              )}
              {renderMedia && isVideoNode(event.kind, node) && (
                <MediaWrapper size={size} src={node.attrs.src}>
                  <Video src={node.attrs.src} />
                </MediaWrapper>
              )}
              {node.type === 'nevent' && <NEvent pointer={node.attrs} event={event} />}
              {node.type === 'naddr' && <NAddr pointer={node.attrs} event={event} />}
              {node.type === 'orderedList' && <List type='ol' node={node} />}
              {node.type === 'bulletList' && <List type='ul' node={node} />}
              {node.type === 'codeBlock' && <CodeBlock node={node} />}
              {node.type === 'blockquote' && <BlockQuote node={node} />}
              {node.type === 'tweet' && <Tweet src={node.attrs.src} />}
              {node.type === 'youtube' && (
                <MediaWrapper size={size} src={node.attrs.src}>
                  <YoutubeEmbed src={node.attrs.src} />
                </MediaWrapper>
              )}
              {node.type === 'bolt11' && <LNInvoice event={event} bolt11={node.attrs.bolt11} lnbc={node.attrs.lnbc} />}
            </>
          </Wrapper>
        )
      })}
    </>
  )
})
