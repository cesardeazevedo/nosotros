import { removeCurrentVideoAtom, setCurrentVideoAtom } from '@/atoms/media.atoms'
import { useNoteContext } from '@/components/providers/NoteProvider'
import type { SxProps } from '@/components/ui/types'
import { useMediaStore } from '@/hooks/useMediaStore'
import { useSettings } from '@/hooks/useSettings'
import { shape } from '@/themes/shape.stylex'
import { useSetAtom } from 'jotai'
import { memo, useEffect, useMemo, useRef } from 'react'
import { css } from 'react-strict-dom'
import { BlurContainer } from '../../Layouts/BlurContainer'

type Props = {
  src: string
  loop?: boolean
  muted?: boolean
  autoPlay?: boolean
  controls?: boolean
  preload?: HTMLVideoElement['preload']
  sx?: SxProps
}

export const Video = memo(function Video(props: Props) {
  const { src, controls = true, muted = false, loop = false, preload = 'metadata', sx } = props
  const { note } = useNoteContext()
  const ref = useRef<HTMLVideoElement>(null)
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])

  const setVideo = useSetAtom(setCurrentVideoAtom)
  const removeVideo = useSetAtom(removeCurrentVideoAtom)
  const media = useMediaStore(src, note.metadata?.imeta)
  const settings = useSettings()
  const autoPlay = props.autoPlay ?? settings.autoPlay

  useEffect(() => {
    const video = ref.current
    if (!video) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && video) {
          setVideo({ video, autoPlay })
        }
      },
      { threshold: 1 },
    )
    observer.observe(video)

    return () => {
      observer.disconnect()
      removeVideo(video)
    }
  }, [media, autoPlay, setVideo, removeVideo])

  return (
    <BlurContainer>
      {({ blurStyles }) => (
        <video
          {...css.props([styles.video, blurStyles, sx])}
          crossOrigin='anonymous'
          playsInline
          webkit-playsinline='true'
          ref={ref}
          loop={loop}
          muted={autoPlay ? true : muted}
          autoPlay={false}
          preload={preload}
          controls={controls}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const video = ref.current
            if (video) {
              return video.paused ? video.play() : video.pause()
            }
          }}
          src={src}
          {...media}>
          <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
        </video>
      )}
    </BlurContainer>
  )
})

const styles = css.create({
  video: {
    borderRadius: shape.lg,
    backgroundColor: '#000',
    objectFit: 'cover',
    width: 'inherit',
    height: 'inherit',
    maxHeight: 'inherit',
    maxWidth: 'inherit',
    transition: 'transform 150ms ease',
    ':active': {
      transform: 'scale(0.985)',
    },
  },
})
