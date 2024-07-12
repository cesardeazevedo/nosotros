import { NodeViewWrapper, type NodeViewRendererProps } from '@tiptap/react'
import Tag from './Tag'

function TagEditor(props: NodeViewRendererProps) {
  return (
    <NodeViewWrapper>
      <Tag>{props.node.attrs.tag}</Tag>
    </NodeViewWrapper>
  )
}

export default TagEditor
