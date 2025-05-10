import { NodeViewWrapper, type NodeViewRendererProps } from '@tiptap/react'
import { Tweet, type Props as TweetProps } from './Tweet'

export const TweetEditor = (props: NodeViewRendererProps) => {
  const attrs = props.node.attrs as TweetProps
  return (
    <NodeViewWrapper data-drag-handle='' draggable={props.node.type.spec.draggable}>
      <Tweet src={attrs.src} />
    </NodeViewWrapper>
  )
}
