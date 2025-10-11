import { addMediaDimAtom } from '@/atoms/media.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { useSetAtom } from 'jotai'
import type { VideoAttributes } from 'nostr-editor'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import { DeleteButton } from '../Buttons/DeleteButton'
import { MediaError } from '../Layout/MediaError'
import { MediaUploading } from '../Layout/MediaUploading'
import { MediaWrapper, type Props as MediaWrapperProps } from '../Layout/MediaWrapper'

type Props = VideoAttributes & {
  onUpdate: (attrs: Partial<VideoAttributes>) => void
  onDelete: () => void
  sx?: SxProps
  cover?: boolean
  uploading?: boolean
  wrapperProps?: Omit<MediaWrapperProps, 'children' | 'src'>
}

export const VideoEditor = (props: Props) => {
  const { src, sx, uploading, error, wrapperProps, cover } = props
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])
  const addMediaDim = useSetAtom(addMediaDimAtom)
  return (
    <>
      <ContentProvider value={{ dense: true }}>
        <MediaWrapper mode='single_editor' src={src} sx={styles.wrapper} {...wrapperProps}>
          <DeleteButton onClick={() => props.onDelete()} />
          <MediaUploading uploading={uploading}>
            <video
              {...css.props([styles.root, cover && styles.cover, sx])}
              loop
              muted
              autoPlay
              preload='autor'
              controls={false}
              onLoadedMetadata={(e) => {
                const element = e.target as HTMLVideoElement
                addMediaDim({ src, dim: [element.videoWidth, element.videoHeight] })
              }}
              src={src}>
              <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
            </video>
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
  root: {
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
    width: '100%',
  },
})
