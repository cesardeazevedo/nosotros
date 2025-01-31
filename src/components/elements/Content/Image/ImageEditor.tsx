import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { ImageAttributes } from 'nostr-editor'
import { css } from 'react-strict-dom'
import { AltButton } from '../Buttons/AltButton'
import { DeleteButton } from '../Buttons/DeleteButton'
import { UploadButton } from '../Buttons/UploadButton'
import { Image } from './Image'

export const ImageEditor = (props: NodeViewProps) => {
  const { src, alt } = props.node.attrs as ImageAttributes
  const isUploaded = !src.startsWith('blob://http')
  return (
    <NodeViewWrapper
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      {...css.props([styles.root, props.selected && styles.root$selected])}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <Image src={src} proxy={false} />
      {!isUploaded && <AltButton value={alt} onChange={(alt) => props.updateAttributes({ alt })} />}
      <UploadButton node={props} />
    </NodeViewWrapper>
  )
}

const styles = css.create({
  root: {
    width: 'fit-content',
    height: 'fit-content',
    position: 'relative',
    opacity: 1,
  },
  root$selected: {
    opacity: 0.9,
  },
})
