import { NodeViewWrapper, type NodeViewRendererProps } from '@tiptap/react'
import Tweet, { type Props as TweetProps } from './Tweet'

function TweetEditor(props: NodeViewRendererProps) {
  const attrs = props.node.attrs as TweetProps
  return (
    <NodeViewWrapper as='div' style={{ maxHeight: 565 }}>
      <Tweet src={attrs.src} />
    </NodeViewWrapper>
  )
}

export default TweetEditor
