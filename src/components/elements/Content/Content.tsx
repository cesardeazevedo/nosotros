import { observer } from 'mobx-react-lite'
import React from 'react'
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
  bubble?: boolean
}

export const Content = observer(function Content(props: Props) {
  const { note, dense } = props
  return (
    <>
      {note.meta.contentSchema?.content.map((node, index) => {
        const common = { dense }
        return (
          <React.Fragment key={node.type + index}>
            {node.type === 'heading' && <Heading node={node} />}
            {node.type === 'paragraph' && (
              <>
                {props.bubble ? (
                  <Bubble node={node} note={note} renderUserHeader={index === 0} />
                ) : (
                  <Paragraph {...common} node={node} />
                )}
              </>
            )}
            {node.type === 'image' && <Image {...common} note={note} src={node.attrs.src} />}
            {node.type === 'video' && <Video {...common} src={node.attrs.src} />}
            {node.type === 'note' && <NoteContent {...common} noteId={node.attrs.id} author={node.attrs.author} />}
            {node.type === 'orderedList' && <List {...common} type='ol' node={node} note={note} />}
            {node.type === 'bulletList' && <List {...common} type='ul' node={node} note={note} />}
            {node.type === 'codeBlock' && <CodeBlock node={node} />}
            {node.type === 'blockquote' && <BlockQuote node={node} />}
            {node.type === 'tweet' && <Tweet src={node.attrs.src} />}
            {node.type === 'youtube' && <YoutubeEmbed src={node.attrs.src} />}
          </React.Fragment>
        )
      })}
    </>
  )
})
