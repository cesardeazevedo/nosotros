import { spacing } from '@/themes/spacing.stylex'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import { css } from 'react-strict-dom'
import { DeleteButton } from '../Buttons/DeleteButton'
import { Spotify, type Props as SpotifyProps } from './Spotify'

export const SpotifyEditor = (props: NodeViewProps) => {
  const attrs = props.node.attrs as SpotifyProps
  return (
    <NodeViewWrapper data-drag-handle='' draggable={props.node.type.spec.draggable} {...css.props(styles.root)}>
      <DeleteButton onClick={props.deleteNode} />
      <Spotify src={attrs.src} />
    </NodeViewWrapper>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    width: '100%',
    marginBlock: spacing.margin1,
  },
})

