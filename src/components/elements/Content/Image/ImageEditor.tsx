import { addMediaDimAtom } from '@/atoms/media.atoms'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { useSetAtom } from 'jotai'
import type { ImageAttributes } from 'nostr-editor'
import { css, html } from 'react-strict-dom'
import { DeleteButton } from '../Buttons/DeleteButton'
import { MediaUploading } from '../Layout/MediaUploading'

type Props = ImageAttributes & {
  onUpdate: (attrs: Partial<ImageAttributes>) => void
  onDelete: () => void
  sx?: SxProps
  cover?: boolean
  uploading?: boolean
}

export const ImageEditor = (props: Props) => {
  const { src, sx, uploading, cover } = props
  const addMediaDim = useSetAtom(addMediaDimAtom)
  return (
    <>
      <DeleteButton onClick={() => props.onDelete()} />
      <MediaUploading uploading={uploading}>
        <html.img
          src={src}
          style={[styles.img, cover && styles.cover, sx]}
          onLoad={(e: { target: HTMLImageElement }) => {
            addMediaDim({ src, dim: [e.target.naturalWidth, e.target.naturalHeight] })
          }}
        />
      </MediaUploading>
    </>
  )
}

const styles = css.create({
  img: {
    height: '100%',
    width: 'fit-content',
    maxHeight: 'inherit',
    cursor: 'pointer',
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.xl,
    transition: 'transform 150ms ease',
    ':active': { transform: 'scale(0.985)' },
  },
  cover: {
    objectFit: 'cover',
  },
})
