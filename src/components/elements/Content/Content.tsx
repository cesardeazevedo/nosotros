import { useNoteContext } from '@/components/providers/NoteProvider'
import { observer } from 'mobx-react-lite'
import type { Node } from 'nostr-editor'
import React from 'react'
import { Image } from './Image/Image'
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

export const Content = observer(function Content(props: Props) {
  const { wrapper, children, renderMedia = true } = props
  const { note } = useNoteContext()
  return (
    <>
      {note.metadata.contentSchema?.content.map((node, index) => {
        const Wrapper = wrapper?.(node) || React.Fragment
        return (
          <Wrapper key={node.type + index}>
            <>
              {children?.(index)}
              {node.type === 'heading' && <Heading node={node} />}
              {node.type === 'paragraph' && <Paragraph node={node} />}
              {renderMedia && node.type === 'image' && <Image src={node.attrs.src} />}
              {renderMedia && node.type === 'video' && <Video src={node.attrs.src} />}
              {node.type === 'nevent' && <NEvent pointer={node.attrs} />}
              {node.type === 'naddr' && <NAddr pointer={node.attrs} />}
              {node.type === 'orderedList' && <List type='ol' node={node} />}
              {node.type === 'bulletList' && <List type='ul' node={node} />}
              {node.type === 'codeBlock' && <CodeBlock node={node} />}
              {node.type === 'blockquote' && <BlockQuote node={node} />}
              {node.type === 'tweet' && <Tweet src={node.attrs.src} />}
              {node.type === 'youtube' && <YoutubeEmbed src={node.attrs.src} />}
              {node.type === 'bolt11' && (
                <LNInvoice nevent={note.event.nevent} bolt11={node.attrs.bolt11} lnbc={node.attrs.lnbc} />
              )}
            </>
          </Wrapper>
        )
      })}
    </>
  )
})
