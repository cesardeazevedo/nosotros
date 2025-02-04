import type { SxProps } from '@/components/ui/types'
import { shape } from '@/themes/shape.stylex'
import type { ImageAttributes } from 'nostr-editor'
import { css, html } from 'react-strict-dom'
import { AltButton } from '../Buttons/AltButton'
import { DeleteButton } from '../Buttons/DeleteButton'
import { UploadButton } from '../Buttons/UploadButton'

type Props = ImageAttributes & {
  onUpdate: (attrs: Partial<ImageAttributes>) => void
  onDelete: () => void
  sx?: SxProps
}

export const ImageEditor = (props: Props) => {
  const { src, alt, sx } = props
  const isUploaded = !src.startsWith('blob://http')
  return (
    <>
      <DeleteButton onClick={() => props.onDelete()} />
      <html.img src={src} style={[styles.img, sx]} />
      {!isUploaded && <AltButton value={alt} onChange={(alt) => props.onUpdate({ alt })} />}
      <UploadButton {...props} onUpdate={props.onUpdate} />
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
