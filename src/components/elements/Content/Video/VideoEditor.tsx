import type { NodeViewRendererProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import Video, { type Props as VideoProps } from './Video'

export default function VideoEditor(props: NodeViewRendererProps) {
  const attrs = props.node.attrs as VideoProps
  return (
    <NodeViewWrapper as='div'>
      <Video {...attrs} />
    </NodeViewWrapper>
  )
}
