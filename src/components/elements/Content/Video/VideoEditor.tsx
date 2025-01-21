import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import type { VideoAttributes } from 'nostr-editor'
import { AltButton } from '../Buttons/AltButton'
import { DeleteButton } from '../Buttons/DeleteButton'
import { Video } from './Video'

export const VideoEditor = (props: NodeViewProps) => {
  const attrs = props.node.attrs as VideoAttributes
  const isUploaded = !attrs.src.startsWith('blob://http')
  return (
    <NodeViewWrapper
      as='div'
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      style={{ width: 'fit-content', height: 'fit-content', position: 'relative', opacity: props.selected ? 0.8 : 1 }}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <Video {...attrs} autoPlay muted loop preload='none' controls={false} />
      {!isUploaded && <AltButton value={attrs.alt} onChange={(alt) => props.updateAttributes({ alt })} />}
    </NodeViewWrapper>
  )
}
