import { addMediaDimAtom, currentVideoAtom, removeCurrentVideoAtom, setCurrentVideoAtom } from '@/atoms/media.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import type { SxProps } from '@/components/ui/types'
import { useNevent } from '@/hooks/useEventUtils'
import { useMediaStore } from '@/hooks/useMediaStore'
import { useSettings } from '@/hooks/useSettings'
import { shape } from '@/themes/shape.stylex'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo, useEffect, useMemo, useRef } from 'react'
import { css } from 'react-strict-dom'
import { BlurContainer } from '../../Layouts/BlurContainer'
import { LinkNEvent } from '../../Links/LinkNEvent'

type Props = {
  src: string
  loop?: boolean
  muted?: boolean
  autoPlay?: boolean
  controls?: boolean
  index?: number
  preload?: HTMLVideoElement['preload']
  sx?: SxProps
}

export const Video = memo(function Video(props: Props) {
  const { src, controls = true, muted = false, loop = false, preload = 'metadata', index, sx } = props
  const { event } = useNoteContext()
  const { autoPlay: contextAutoPlay } = useContentContext()
  const nevent = useNevent(event)
  const ref = useRef<HTMLVideoElement>(null)
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])

  const addMediaDim = useSetAtom(addMediaDimAtom)
  const setVideo = useSetAtom(setCurrentVideoAtom)
  const removeVideo = useSetAtom(removeCurrentVideoAtom)
  const currentVideo = useAtomValue(currentVideoAtom)
  const media = useMediaStore(src, event.metadata?.imeta)
  const settings = useSettings()
  const autoPlay = contextAutoPlay ?? props.autoPlay ?? settings.autoPlay

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
        <LinkNEvent media block nevent={nevent} search={{ media: index }}>
          <video
            {...css.props([styles.video, blurStyles, sx])}
            playsInline
            role='button'
            webkit-playsinline='true'
            ref={ref}
            loop={loop}
            muted={autoPlay ? true : muted}
            autoPlay={false}
            preload={preload}
            controls={controls}
            onLoadedMetadata={(e) => {
              const element = e.target as HTMLVideoElement
              if (!event.metadata?.imeta?.[src].dim) {
                addMediaDim({ src, dim: [element.videoWidth, element.videoHeight] })
              }
            }}
            src={src}
            {...media}>
            <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
          </video>
        </LinkNEvent>
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
    minWidth: 140,
    width: 'fit-content',
    // height: '100%',
    maxHeight: 560,
    backgroundColor: '#000',
    borderRadius: shape.lg,
    transition: 'transform 150ms ease',
    ':active': {
      transform: 'scale(0.985)',
    },
  },
})
