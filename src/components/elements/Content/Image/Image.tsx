import { styled } from '@mui/material'
import { useRef } from 'react'
import { useStore } from 'stores'
import type { Note } from 'stores/modules/note.store'

type Props = {
  dense?: boolean
  src: string
  note: Note
}

const shouldForwardProp = (prop: string) => prop !== 'dense'

const Img = styled('img', { shouldForwardProp })<{ dense?: boolean }>(({ dense }) => ({
  objectFit: 'cover',
  width: '100%',
  maxWidth: 600,
  maxHeight: 600,
  marginTop: dense ? 6 : 10,
  marginBottom: 10,
  borderRadius: dense ? 16 : 0,
}))

function Image(props: Props) {
  const { note, dense, src } = props
  const ref = useRef<HTMLImageElement>(null)
  const store = useStore()

  const width = note.imeta?.metadata?.[src]?.dim?.width
  const height = note.imeta?.metadata?.[src]?.dim?.height
  // const blurhash = note.imeta?.metadata?.[url]?.blurhash

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        maxHeight: 800,
        maxWidth: 600,
      }}
      onClick={() => store.dialogs.pushImage(src)}>
      {/* Too slow, not worth it */}
      {/* <ImageBlur width={width} height={height} blurhash={blurhash} render={!loaded} /> */}
      <Img
        ref={ref}
        dense={dense}
        src={store.settings.getImgProxyUrl('feed_img', src)}
        loading='lazy'
        width={width || '100%'}
        height={height || '100%'}
      />
    </div>
  )
}

export default Image
