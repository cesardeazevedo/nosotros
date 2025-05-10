import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { css } from 'react-strict-dom'
import { DeleteButton } from '../Buttons/DeleteButton'
import { YoutubeEmbed } from './YoutubeEmbed'
import { spacing } from '@/themes/spacing.stylex'

export const YoutubeEditor = (props: NodeViewProps) => {
  const args = props.node.attrs as { src: string }

  return (
    <NodeViewWrapper
      as='div'
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      {...css.props(styles.root)}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <YoutubeEmbed {...args} />
    </NodeViewWrapper>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    userSelect: 'none',
    width: 'fit-content',
    marginBlock: spacing.margin1,
  },
})
