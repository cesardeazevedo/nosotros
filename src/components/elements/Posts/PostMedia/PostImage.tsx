import { styled } from '@mui/material'
import { memo, useRef } from 'react'
import { BlurhashCanvas } from 'react-blurhash'
import { useInView } from 'react-intersection-observer'
import { useStore } from 'stores'
import { Note } from 'stores/modules/note.store'

type Props = {
  dense?: boolean
  content: string
  note: Note
}

type BlurImgProps = {
  blurhash?: string | null
  width?: number
  height?: number
  render?: boolean
}

const BlurWrapper = styled('div')({
  position: 'absolute',
  maxHeight: 800,
  maxWidth: 600,
  zIndex: 1000,
})

const shouldForwardProp = (prop: string) => prop !== 'dense'

const Img = styled('img', { shouldForwardProp })<{ dense?: boolean }>(({ dense }) => ({
  objectFit: 'cover',
  width: '100%',
  height: 'auto',
  maxWidth: 600,
  maxHeight: 600,
  marginTop: dense ? 6 : 10,
  marginBottom: 10,
  borderRadius: dense ? 16 : 0,
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ImageBlur = memo(function BlurImg(props: BlurImgProps) {
  const { blurhash, width, height, render = false } = props
  const [ref, inView] = useInView({ rootMargin: '100%' })
  return (
    <span ref={ref}>
      {blurhash && render && inView && (
        <BlurWrapper sx={{ width: '100%', height: 'auto' }}>
          <BlurhashCanvas
            hash={blurhash}
            width={width}
            height={height}
            punch={1}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </BlurWrapper>
      )}
    </span>
  )
})

function PostImage(props: Props) {
  const { note, dense } = props
  const ref = useRef<HTMLImageElement>(null)
  const store = useStore()

  const url = props.content

  const width = note.imeta?.metadata?.[url]?.dim?.width
  const height = note.imeta?.metadata?.[url]?.dim?.height
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
      onClick={() => store.dialogs.pushImage(props.content)}>
      {/* Too slow, not worth it */}
      {/* <ImageBlur width={width} height={height} blurhash={blurhash} render={!loaded} /> */}
      <Img
        ref={ref}
        dense={dense}
        src={store.settings.getImgProxyUrl('600x,q80', props.content)}
        loading='lazy'
        width={width || '100%'}
        height={height || '100%'}
      />
    </div>
  )
}

export default PostImage
