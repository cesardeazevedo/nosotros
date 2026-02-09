import { compressionStateAtom } from '@/atoms/compression.atoms'
import { addMediaDimAtom } from '@/atoms/media.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import type { ImageQuality } from '@/utils/compression'
import { useAtomValue, useSetAtom } from 'jotai'
import type { ImageAttributes } from 'nostr-editor'
import { css, html } from 'react-strict-dom'
import { DeleteButton } from '../Buttons/DeleteButton'
import { MediaDownload } from '../Buttons/MediaDownload'
import { MediaCompressionStatus } from '../Layout/MediaCompressionStatus'
import { MediaError } from '../Layout/MediaError'
import { MediaUploading } from '../Layout/MediaUploading'
import { MediaWrapper, type Props as MediaWrapperProps } from '../Layout/MediaWrapper'

type Props = ImageAttributes & {
  onUpdate: (attrs: Partial<ImageAttributes & { quality?: ImageQuality }>) => void
  onDelete: () => void
  sx?: SxProps
  cover?: boolean
  uploading?: boolean
  wrapperProps?: Omit<MediaWrapperProps, 'children' | 'src'>
}

export const ImageEditor = (props: Props) => {
  const { src, sx, uploading, cover, error, wrapperProps } = props
  const addMediaDim = useSetAtom(addMediaDimAtom)
  const compression = useAtomValue(compressionStateAtom)[src || '']
  const showDownload = Boolean(src && !src.startsWith('blob:') && !src.startsWith('data:'))
  return (
    <>
      <ContentProvider value={{ dense: true }}>
        <MediaWrapper mode='single_editor' sx={styles.wrapper} {...wrapperProps}>
          <DeleteButton onClick={() => props.onDelete()} />
          {showDownload && <MediaDownload src={src} fallbackName='image' />}
          <MediaCompressionStatus src={src} />
          <MediaUploading uploading={uploading && !compression}>
            <html.img
              src={src}
              draggable={false}
              style={[styles.img, cover && styles.cover, sx]}
              onLoad={(e: { target: HTMLImageElement }) => {
                addMediaDim({ src, dim: [e.target.naturalWidth, e.target.naturalHeight] })
              }}
            />
            <MediaError error={error} />
          </MediaUploading>
        </MediaWrapper>
      </ContentProvider>
    </>
  )
}

const styles = css.create({
  wrapper: {
    position: 'relative',
    margin: 0,
    padding: 0,
  },
  img: {
    maxWidth: '100%',
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
    height: '100%',
  },
})
