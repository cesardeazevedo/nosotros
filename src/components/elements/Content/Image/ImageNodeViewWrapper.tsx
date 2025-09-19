import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { ImageAttributes } from 'nostr-editor'
import { css } from 'react-strict-dom'
import { ImageEditor } from './ImageEditor'
import { spacing } from '@/themes/spacing.stylex'

export const ImageNodeViewWrapper = (props: NodeViewProps) => {
  return (
    <NodeViewWrapper
      as='div'
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      {...css.props([styles.root, props.selected && styles.root$selected])}>
      <ImageEditor
        {...(props.node.attrs as ImageAttributes)}
        onUpdate={props.updateAttributes}
        onDelete={props.deleteNode}
      />
    </NodeViewWrapper>
  )
}

const styles = css.create({
  root: {
    width: 'fit-content',
    height: 'fit-content',
    position: 'relative',
    marginBlock: spacing.margin1,
  },
  root$selected: {},
})
