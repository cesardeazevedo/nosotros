import { ContentProvider } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { shape } from '@/themes/shape.stylex'
import type { VideoAttributes } from 'nostr-editor'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import { DeleteButton } from '../Buttons/DeleteButton'
import { MediaUploading } from '../Layout/MediaUploading'

type Props = VideoAttributes & {
  onUpdate: (attrs: Partial<VideoAttributes>) => void
  onDelete: () => void
  sx?: SxProps
  uploading?: boolean
}

export const VideoEditor = (props: Props) => {
  const { src, sx, uploading } = props
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])
  return (
    <>
      <DeleteButton onClick={() => props.onDelete()} />
      <ContentProvider value={{ dense: true }}>
        <MediaUploading uploading={uploading}>
          <video {...css.props([styles.root, sx])} loop muted autoPlay preload='autor' controls={false} src={src}>
            <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
          </video>
        </MediaUploading>
      </ContentProvider>
    </>
  )
}

const styles = css.create({
  root: {
    objectFit: 'contain',
    width: 'auto',
    height: 'auto',
    userSelect: 'none',
    cursor: 'pointer',
    maxHeight: 350,
    borderRadius: shape.lg,
  },
})
