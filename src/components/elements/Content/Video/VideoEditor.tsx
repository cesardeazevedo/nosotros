import { ContentProvider } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
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
})
