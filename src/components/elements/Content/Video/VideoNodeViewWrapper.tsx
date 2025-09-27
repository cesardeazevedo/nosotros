import { spacing } from '@/themes/spacing.stylex'
import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import type { VideoAttributes } from 'nostr-editor'
import { css } from 'react-strict-dom'
import { VideoEditor } from './VideoEditor'

export const VideoNodeViewWrapper = (props: NodeViewProps) => {
  return (
    <NodeViewWrapper
      as='div'
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      {...css.props([styles.root, props.selected && styles.root$selected])}>
      <VideoEditor
        {...(props.node.attrs as VideoAttributes)}
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
