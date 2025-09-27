import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NAddrAttributes } from 'nostr-editor'
import { css, html } from 'react-strict-dom'
import { DeleteButton } from '../Buttons/DeleteButton'
import { NAddr } from './NAddr'

export const NAddrEditor = (props: NodeViewProps) => {
  const attrs = props.node.attrs as NAddrAttributes
  const { bech32 } = attrs as NAddrAttributes

  return (
    <NodeViewWrapper
      as='div'
      data-naddr={bech32}
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      style={{ position: 'relative', height: 'fit-content', width: 'auto' }}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <html.div style={[styles.wrapper, props.selected && styles.wrapper$selected]}>
        <NAddr pointer={attrs} />
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
