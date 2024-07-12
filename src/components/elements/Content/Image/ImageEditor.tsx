import type { ImageOptions } from '@tiptap/extension-image'
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeConfig, type NodeViewRendererProps } from '@tiptap/react'

export default function ImageEditor(props: NodeViewRendererProps) {
  const { src, alt } = props.node.attrs
  return (
    <NodeViewWrapper as='img' src={src} alt={alt}>
      <img src={src} alt={alt} />
    </NodeViewWrapper>
  )
}

export function addImageNodeView(): Partial<NodeConfig<ImageOptions>> {
  return {
    addNodeView() {
      return ReactNodeViewRenderer(ImageEditor)
    },
  }
}
