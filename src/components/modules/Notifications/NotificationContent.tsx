import { eventStore } from '@/stores/events/event.store'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css, html } from 'react-strict-dom'
import { NEventInline } from '../../elements/Content/NEvent/NEventInline'
import { TextContent } from '../../elements/Content/Text'

type Props = {
  id: string | undefined
}

export const NotificationContent = observer(function NotificationContent(props: Props) {
  const event = eventStore.get(props.id)
  if (!event) {
    return
  }
  return (
    <html.div style={styles.root}>
      {event.metadata.contentSchema?.content.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'heading' && <TextContent hardBreak={false} node={node} />}
          {node.type === 'paragraph' && <TextContent size='md' hardBreak={false} node={node} />}
          {node.type === 'image' && <></>}
          {node.type === 'video' && node.attrs.src}
          {node.type === 'nevent' && <NEventInline attrs={node.attrs} />}
          {node.type === 'naddr' && node.attrs.bech32.slice(0, 10)}
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
    overflow: 'hidden',
    WebkitLineClamp: 3,
    boxOrient: 'vertical',
    WebkitBoxOrient: 'vertical',
    display: '-webkit-box',
    pointerEvents: 'none',
  },
})
