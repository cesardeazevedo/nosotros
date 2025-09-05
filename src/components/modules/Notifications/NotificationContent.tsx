import { NoteProvider } from '@/components/providers/NoteProvider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { NEventInline } from '../../elements/Content/NEvent/NEventInline'
import { TextContent } from '../../elements/Content/Text'

type Props = {
  event: NostrEventDB
  dense?: boolean
}

export const NotificationContent = memo(function NotificationContent(props: Props) {
  const { event, dense } = props
  return (
    <NoteProvider value={{ event }}>
      <html.div style={[styles.root, dense && styles.root$dense]}>
        {event.metadata?.contentSchema?.content.map((node, index) => (
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
    </NoteProvider>
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
  },
  root$dense: {
    WebkitLineClamp: 1,
  },
})
