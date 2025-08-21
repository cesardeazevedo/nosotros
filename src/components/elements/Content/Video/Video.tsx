import { currentVideoAtom, removeCurrentVideoAtom, setCurrentVideoAtom } from '@/atoms/media.atoms'
import { useNoteContext } from '@/components/providers/NoteProvider'
import type { SxProps } from '@/components/ui/types'
import { useMediaStore } from '@/hooks/useMediaStore'
import { useSettings } from '@/hooks/useSettings'
import { shape } from '@/themes/shape.stylex'
import { useAtomValue, useSetAtom } from 'jotai'
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
  const currentVideo = useAtomValue(currentVideoAtom)
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
        if (entry.isIntersecting && currentVideo !== video) {
          setVideo({ video, play: autoPlay })
        }
      },
      { threshold: 0.7 },
    )
    observer.observe(video)

    return () => {
      observer.disconnect()
      removeVideo(video)
    }
  }, [autoPlay, setVideo, removeVideo])

  return (
    <BlurContainer>
      {({ blurStyles }) => (
        <video
          {...css.props([styles.video, blurStyles, sx])}
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
              setVideo({ video, play: video.paused })
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
    display: 'block',
    blockSize: 'auto',
    inlineSize: '100%',
    maxInlineSize: '100%',
    width: 'fit-content',
    maxHeight: 500,
    backgroundColor: '#000',
    borderRadius: shape.lg,
    transition: 'transform 150ms ease',
    ':active': {
      transform: 'scale(0.985)',
    },
  },
})
