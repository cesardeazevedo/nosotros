import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { ImageAttributes } from 'nostr-editor'
import { css, html } from 'react-strict-dom'
import { AltButton } from '../Buttons/AltButton'
import { DeleteButton } from '../Buttons/DeleteButton'
import { UploadButton } from '../Buttons/UploadButton'

export const ImageEditor = (props: NodeViewProps) => {
  const { src, alt } = props.node.attrs as ImageAttributes
  const isUploaded = !src.startsWith('blob://http')
  return (
    <NodeViewWrapper
      as='div'
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      {...css.props([styles.root, props.selected && styles.root$selected])}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <html.img src={src} style={styles.img} />
      {!isUploaded && <AltButton value={alt} onChange={(alt) => props.updateAttributes({ alt })} />}
      <UploadButton node={props} />
    </NodeViewWrapper>
  )
}

const MOBILE = '@media (max-width: 599.95px)'

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
  img: {
    objectFit: 'contain',
    width: 'auto',
    height: 'auto',
    userSelect: 'none',
    cursor: 'pointer',
    maxWidth: {
      default: 400,
      [MOBILE]: 'calc(100vw - 90px)',
    },
    maxHeight: 350,
    borderRadius: shape.lg,
    marginBlock: spacing.margin1,
  },
})
