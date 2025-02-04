import { ContentProvider } from '@/components/providers/ContentProvider'
import type { SxProps } from '@/components/ui/types'
import { shape } from '@/themes/shape.stylex'
import type { VideoAttributes } from 'nostr-editor'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import { AltButton } from '../Buttons/AltButton'
import { DeleteButton } from '../Buttons/DeleteButton'
import { UploadButton } from '../Buttons/UploadButton'

type Props = VideoAttributes & {
  onUpdate: (attrs: Partial<VideoAttributes>) => void
  onDelete: () => void
  sx?: SxProps
}

export const VideoEditor = (props: Props) => {
  const { src, sx } = props
  const isUploaded = !src.startsWith('blob://http')
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])
  return (
    <>
      <DeleteButton onClick={() => props.onDelete()} />
      <ContentProvider value={{ dense: true }}>
        <video {...css.props([styles.root, sx])} loop muted autoPlay preload='autor' controls={false} src={src}>
          <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
        </video>
      </ContentProvider>
      {!isUploaded && <AltButton value={props.alt} onChange={(alt) => props.onUpdate({ alt })} />}
      <UploadButton {...props} />
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
