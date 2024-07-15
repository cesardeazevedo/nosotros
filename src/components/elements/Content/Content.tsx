import { observer } from 'mobx-react-lite'
import React, { createContext } from 'react'
import type Note from 'stores/models/note'
import Image from './Image/Image'
import Bubble from './Layout/Bubble'
import Paragraph from './Layout/Paragraph'
import BlockQuote from './Markdown/BlockQuote'
import CodeBlock from './Markdown/CodeBlock'
import Heading from './Markdown/Heading'
import List from './Markdown/List'
import NoteContent from './Note/Note'
import Tweet from './Tweet/Tweet'
import Video from './Video/Video'
import YoutubeEmbed from './Youtube/YoutubeEmbed'

type Props = {
  note: Note
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
              <>
                {props.bubble ? (
                  <Bubble node={node} note={note} renderUserHeader={index === 0} />
                ) : (
                  <Paragraph node={node} />
                )}
              </>
            )}
            {node.type === 'image' && <Image note={note} src={node.attrs.src} />}
            {node.type === 'video' && <Video src={node.attrs.src} />}
            {node.type === 'note' && <NoteContent noteId={node.attrs.id} author={node.attrs.author} />}
            {node.type === 'orderedList' && <List type='ol' node={node} note={note} />}
            {node.type === 'bulletList' && <List type='ul' node={node} note={note} />}
            {node.type === 'codeBlock' && <CodeBlock node={node} />}
            {node.type === 'blockquote' && <BlockQuote node={node} />}
            {node.type === 'tweet' && <Tweet src={node.attrs.src} />}
            {node.type === 'youtube' && <YoutubeEmbed src={node.attrs.src} />}
          </React.Fragment>
        )
      })}
    </ContentContext.Provider>
  )
})
