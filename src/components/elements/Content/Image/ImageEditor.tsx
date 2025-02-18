import type { SxProps } from '@/components/ui/types'
import { shape } from '@/themes/shape.stylex'
import type { ImageAttributes } from 'nostr-editor'
import { css, html } from 'react-strict-dom'
import { DeleteButton } from '../Buttons/DeleteButton'
import { MediaUploading } from '../Layout/MediaUploading'

type Props = ImageAttributes & {
  onUpdate: (attrs: Partial<ImageAttributes>) => void
  onDelete: () => void
  sx?: SxProps
  uploading?: boolean
}

export const ImageEditor = (props: Props) => {
  const { src, sx, uploading } = props
  return (
    <>
      <DeleteButton onClick={() => props.onDelete()} />
      <MediaUploading uploading={uploading}>
        <html.img src={src} style={[styles.img, sx]} />
      </MediaUploading>
    </>
  )
}

const styles = css.create({
  img: {
    objectFit: 'contain',
    width: 'auto',
    height: 'auto',
    userSelect: 'none',
    cursor: 'pointer',
    maxHeight: 350,
    borderRadius: shape.lg,
  },
})
