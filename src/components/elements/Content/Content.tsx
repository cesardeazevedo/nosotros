import { observer } from 'mobx-react-lite'
import React from 'react'
import type { Note as NoteStore } from 'stores/modules/note.store'
import Bubble from './Bubble'
import Image from './Image/Image'
import { BlockQuote } from './Markdown/BlockQuote'
import CodeBlock from './Markdown/CodeBlock'
import { Heading } from './Markdown/Heading'
import List from './Markdown/List'
import Note from './Note/Note'
import { Paragraph } from './Paragraph'
import Tweet from './Tweet/Tweet'
import Video from './Video/Video'
import YoutubeEmbed from './Youtube/YoutubeEmbed'

type Props = {
  note: NoteStore
  dense?: boolean
  bubble?: boolean
}

export const Content = observer(function Content(props: Props) {
  const { note, dense } = props
  return (
    <>
      {note.contentSchema?.content.map((node, index) => {
        const common = { dense }
        return (
          <React.Fragment key={node.type + index}>
            {node.type === 'heading' && <Heading node={node} />}
            {node.type === 'paragraph' && (
              <>
                {props.bubble && node.content?.[0]?.type === 'text' ? (
                  <Bubble node={node} note={note} renderUserHeader={index === 0} />
                ) : (
                  <Paragraph {...common} node={node} />
                )}
              </>
            )}
            {node.type === 'image' && <Image {...common} note={note} src={node.attrs.src} />}
            {node.type === 'video' && <Video {...common} src={node.attrs.src} />}
            {node.type === 'note' && <Note noteId={node.attrs.id} author={node.attrs.author} />}
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
