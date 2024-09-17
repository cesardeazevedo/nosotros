import { observer } from 'mobx-react-lite'
import React, { createContext } from 'react'
import type Note from 'stores/models/note'
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
  note: Note
  header?: React.ReactNode
  dense?: boolean
  disableLink?: boolean
  bubble?: boolean
}

export const ContentContext = createContext({
  dense: false,
  disableLink: false,
})

export const Content = observer(function Content(props: Props) {
  const { note, dense = false, disableLink = false } = props
  return (
    <ContentContext.Provider value={{ dense, disableLink }}>
      {note.meta.contentSchema?.content.map((node, index) => {
        return (
          <React.Fragment key={node.type + index}>
            {node.type === 'heading' && <Heading node={node} />}
            {node.type === 'paragraph' && (
              <Paragraph node={node} bubble={props.bubble}>
                {index === 0 && props.header}
              </Paragraph>
            )}
            {node.type === 'image' && <Image src={node.attrs.src} />}
            {node.type === 'video' && <Video src={node.attrs.src} />}
            {/* @ts-expect-error (old schema) */}
            {(node.type === 'nevent' || node.type === 'note') && (
              <NEvent noteId={node.attrs.id} author={node.attrs.author} />
            )}
            {node.type === 'naddr' && <NAddr {...node.attrs} />}
            {node.type === 'orderedList' && <List type='ol' node={node} note={note} />}
            {node.type === 'bulletList' && <List type='ul' node={node} note={note} />}
            {node.type === 'codeBlock' && <CodeBlock node={node} />}
            {node.type === 'blockquote' && <BlockQuote node={node} />}
            {node.type === 'tweet' && <Tweet src={node.attrs.src} />}
            {node.type === 'youtube' && <YoutubeEmbed src={node.attrs.src} />}
            {node.type === 'bolt11' && <LNInvoice bolt11={node.attrs.bolt11} lnbc={node.attrs.lnbc} />}
          </React.Fragment>
        )
      })}
    </ContentContext.Provider>
  )
})
