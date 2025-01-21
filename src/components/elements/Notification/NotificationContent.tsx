import { noteStore } from '@/stores/notes/notes.store'
import React from 'react'
import { TextContent } from '../Content/Text'
import { html, css } from 'react-strict-dom'
import { observer } from 'mobx-react-lite'
import { NEventInline } from '../Content/NEvent/NEventInline'

type Props = {
  id: string | undefined
}

export const NotificationContent = observer(function NotificationContent(props: Props) {
  const note = noteStore.get(props.id)
  if (!note) {
    return
  }
  return (
    <html.div style={styles.root}>
      {note.metadata.contentSchema?.content.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'heading' && <TextContent hardBreak={false} node={node} />}
          {node.type === 'paragraph' && <TextContent size='md' hardBreak={false} node={node} />}
          {node.type === 'image' && <></>}
          {node.type === 'video' && node.attrs.src}
          {node.type === 'nevent' && <NEventInline disableLink attrs={node.attrs} />}
          {node.type === 'naddr' && node.attrs.naddr.slice(0, 10)}
          {node.type === 'tweet' && node.attrs.src}
          {node.type === 'youtube' && node.attrs.src}
          {node.type === 'bolt11' && node.attrs.lnbc.slice(0, 10)}
        </React.Fragment>
      ))}
    </html.div>
  )
})

const styles = css.create({
  root: {
    wordBreak: 'break-word',
    overflow: 'auto',
    maxHeight: 180,
  },
})
