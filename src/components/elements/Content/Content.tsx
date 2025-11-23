import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Kind } from '@/constants/kinds'
import { getMimeFromExtension } from '@/hooks/parsers/parseImeta'
import { useEventTag } from '@/hooks/useEventUtils'
import type { CustomNode, ImageCustomNode, VideoCustomNode } from '@/nostr/types'
import { groupProsemirrorMedia } from '@/utils/welshmanToProsemirror'
import React, { memo, useMemo } from 'react'
import { Image } from './Image/Image'
import { MediaGroup } from './Layout/MediaGroup'
import { MediaWrapper } from './Layout/MediaWrapper'
import { Paragraph } from './Layout/Paragraph'
import { LNInvoice } from './LNInvoice/LNInvoice'
import { BlockQuote } from './Markdown/BlockQuote'
import { CodeBlock } from './Markdown/CodeBlock'
import { Heading } from './Markdown/Heading'
import { List } from './Markdown/List'
import { NAddr } from './NAddr/NAddr'
import { NEvent } from './NEvent/NEvent'
import { Spotify } from './Spotify/Spotify'
import { Tweet } from './Tweet/Tweet'
import { Video } from './Video/Video'
import { YoutubeEmbed } from './Youtube/YoutubeEmbed'

type Props = {
  wrapper?: (node: CustomNode) => React.ElementType
  children?: (index: number) => React.ReactNode
  renderMedia?: boolean
}

// Markdown videos are embbed as images, we need to figure out this in nostr-editor/tiptap-markdown
const isVideoNode = (kind: Kind, node: CustomNode): node is VideoCustomNode => {
  const type = kind === Kind.Article && node.type === 'image' ? getMimeFromExtension(node.attrs.src) : node.type
  return type === 'video'
}
const isImageNode = (kind: Kind, node: CustomNode): node is ImageCustomNode => {
  const type = kind === Kind.Article && node.type === 'image' ? getMimeFromExtension(node.attrs.src) : node.type
  return type === 'image'
}

export const Content = memo(function Content(props: Props) {
  const { wrapper, children, renderMedia = true } = props
  const { event } = useNoteContext()
  const { dense, blured } = useContentContext()
  const nsfw = useEventTag(event, 'content-warning')
  const schema = useMemo(() => {
    if (event.metadata?.contentSchema) {
      return groupProsemirrorMedia(event.metadata?.contentSchema)
    }
    return { content: [] }
  }, [event])
  return (
    <ContentProvider value={{ blured: !!nsfw || blured }}>
      {schema.content.map((node, index) => {
        const Wrapper = wrapper?.(node) || React.Fragment
        const mode = dense ? 'single_dense' : 'single'
        return (
          <Wrapper key={node.type + index}>
            <>
              {children?.(index)}
              {node.type === 'heading' && <Heading node={node} />}
              {node.type === 'paragraph' && <Paragraph node={node} />}
              {renderMedia && isImageNode(event.kind, node) && (
                <MediaWrapper mode={mode}>
                  <Image src={node.attrs!.src} index={node.index} />
                </MediaWrapper>
              )}
              {renderMedia && isVideoNode(event.kind, node) && (
                <MediaWrapper mode={mode}>
                  <Video src={node.attrs.src} index={node.index} />
                </MediaWrapper>
              )}
              {renderMedia && node.type === 'mediaGroup' && (
                <MediaGroup media={node.content?.map((n) => ({ type: n.type, index: n.index, src: n.attrs.src }))} />
              )}
              {node.type === 'nevent' && <NEvent pointer={node.attrs} event={event} />}
              {node.type === 'naddr' && <NAddr pointer={node.attrs} event={event} />}
              {node.type === 'orderedList' && <List type='ol' node={node} />}
              {node.type === 'bulletList' && <List type='ul' node={node} />}
              {node.type === 'codeBlock' && <CodeBlock node={node} />}
              {node.type === 'blockquote' && <BlockQuote node={node} />}
              {node.type === 'tweet' && <Tweet src={node.attrs.src} />}
              {node.type === 'spotify' && (
                <MediaWrapper mode={mode}>
                  <Spotify src={node.attrs.src} />
                </MediaWrapper>
              )}
              {node.type === 'youtube' && (
                <MediaWrapper mode={mode}>
                  <YoutubeEmbed src={node.attrs.src} />
                </MediaWrapper>
              )}
              {node.type === 'bolt11' && <LNInvoice event={event} bolt11={node.attrs.bolt11} lnbc={node.attrs.lnbc} />}
            </>
          </Wrapper>
        )
      })}
    </ContentProvider>
  )
})
