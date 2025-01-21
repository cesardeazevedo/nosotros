import { useObservableNostrContext } from '@/stores/context/nostr.context.hooks'
import { palette } from '@/themes/palette.stylex'
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
      context.client.notes.subNotesWithRelated(
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
      style={{ position: 'relative', height: 'fit-content', width: 'auto' }}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <html.div style={[styles.wrapper, props.selected && styles.wrapper$selected]}>
        <NEvent pointer={attrs} />
      </html.div>
    </NodeViewWrapper>
  )
}

const styles = css.create({
  wrapper: {
    width: '100%',
    marginBlock: spacing.padding2,
    borderRadius: 2,
    [palette.outlineVariant]: palette.outline,
  },
  wrapper$dense: {},
  wrapper$selected: {
    opacity: 0.8,
    borderRadius: shape.lg,
  },
})
