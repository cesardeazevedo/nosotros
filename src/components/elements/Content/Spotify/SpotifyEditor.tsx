import { NodeViewWrapper, type NodeViewRendererProps } from '@tiptap/react'
import { Spotify, type Props as SpotifyProps } from './Spotify'

export const SpotifyEditor = (props: NodeViewRendererProps) => {
  const attrs = props.node.attrs as SpotifyProps
  return (
    <NodeViewWrapper data-drag-handle='' draggable={props.node.type.spec.draggable}>
      <Spotify src={attrs.src} />
    </NodeViewWrapper>
  )
}