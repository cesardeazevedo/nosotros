import { NodeViewWrapper, type NodeViewRendererProps } from '@tiptap/react'
import { Mention, type Props as MentionProps } from './Mention'

export function MentionEditor(props: NodeViewRendererProps) {
  const attrs = props.node.attrs as MentionProps
  return (
    <NodeViewWrapper as='span'>
      <Mention pubkey={attrs.pubkey} />
    </NodeViewWrapper>
  )
}
