import { useObservableNostrContext } from '@/stores/context/nostr.context.hooks'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NEventAttributes } from 'nostr-editor'
import { useSubscription } from 'observable-hooks'
import { css, html } from 'react-strict-dom'
import { merge } from 'rxjs'
import { DeleteButton } from '../Buttons/DeleteButton'
import { NEvent } from './NEvent'

export const NEventEditor = (props: NodeViewProps) => {
  const attrs = props.node.attrs as NEventAttributes
  const sub = useObservableNostrContext((context) => {
    return merge(
      context.client.notes.subWithRelated(
        { ids: [attrs.id] },
        { relayHints: { fallback: { [attrs.id]: [attrs.author] } } },
      ),
      context.client.users.subscribe(attrs.author),
    )
  })
  useSubscription(sub)
  return (
    <NodeViewWrapper
      as='div'
      data-nevent={attrs.nevent}
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      style={{ position: 'relative', height: 'fit-content', width: 'fit-content' }}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <html.div style={[styles.wrapper, props.selected && styles.wrapper$selected]}>
        <NEvent noteId={attrs.id} />
      </html.div>
    </NodeViewWrapper>
  )
}

const styles = css.create({
  wrapper: {
    marginBlock: spacing.padding2,
    backgroundColor: 'transparent',
    borderRadius: 2,
  },
  wrapper$selected: {
    opacity: 0.8,
    borderRadius: shape.lg,
  },
})
