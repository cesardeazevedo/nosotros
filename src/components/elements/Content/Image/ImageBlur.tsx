import { styled } from '@mui/material'
import { memo } from 'react'
import { BlurhashCanvas } from 'react-blurhash'
import { useInView } from 'react-intersection-observer'

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

export const ImageBlur = memo(function BlurImg(props: BlurImgProps) {
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
