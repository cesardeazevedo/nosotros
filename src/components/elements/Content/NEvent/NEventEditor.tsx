import { ContentProvider } from '@/components/providers/ContentProvider'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NEventAttributes } from 'nostr-editor'
import { css, html } from 'react-strict-dom'
import { DeleteButton } from '../Buttons/DeleteButton'
import { NEvent } from './NEvent'

export const NEventEditor = (props: NodeViewProps) => {
  const attrs = props.node.attrs as NEventAttributes
  return (
    <NodeViewWrapper
      as='div'
      data-nevent={attrs.bech32}
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      style={{ position: 'relative', height: 'fit-content', width: 'auto' }}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <html.div style={[styles.wrapper, props.selected && styles.wrapper$selected]}>
        <ContentProvider value={{ dense: true }}>
          <NEvent pointer={attrs} />
        </ContentProvider>
      </html.div>
    </NodeViewWrapper>
  )
}

const styles = css.create({
  wrapper: {
    width: '100%',
    marginBlock: spacing.padding2,
  },
  wrapper$dense: {},
  wrapper$selected: {
    opacity: 0.8,
    borderRadius: shape.lg,
  },
})
