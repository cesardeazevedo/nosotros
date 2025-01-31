import { ContentProvider } from '@/components/providers/ContentProvider'
import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import type { VideoAttributes } from 'nostr-editor'
import { css } from 'react-strict-dom'
import { AltButton } from '../Buttons/AltButton'
import { DeleteButton } from '../Buttons/DeleteButton'
import { UploadButton } from '../Buttons/UploadButton'
import { Video } from './Video'

export const VideoEditor = (props: NodeViewProps) => {
  const attrs = props.node.attrs as VideoAttributes
  const { src } = attrs
  const isUploaded = !src.startsWith('blob://http')
  return (
    <NodeViewWrapper
      as='div'
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      {...css.props([styles.root, props.selected && styles.root$selected])}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <ContentProvider value={{ dense: true }}>
        <Video {...attrs} autoPlay muted loop controls={false} />
      </ContentProvider>
      {!isUploaded && <AltButton value={attrs.alt} onChange={(alt) => props.updateAttributes({ alt })} />}
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
