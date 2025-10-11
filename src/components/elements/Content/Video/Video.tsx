import { addMediaDimAtom, currentVideoAtom, removeCurrentVideoAtom, setCurrentVideoAtom } from '@/atoms/media.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'
import type { SxProps } from '@/components/ui/types'
import { useNevent } from '@/hooks/useEventUtils'
import { useMediaStore } from '@/hooks/useMediaStore'
import { useSettings } from '@/hooks/useSettings'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo, useEffect, useMemo, useRef } from 'react'
import { css } from 'react-strict-dom'
import { BlurContainer } from '../../Layouts/BlurContainer'
import { LinkNEvent } from '../../Links/LinkNEvent'
import { VideoControls } from './VideoControls'

type Props = {
  src: string
  loop?: boolean
  muted?: boolean
  autoPlay?: boolean
  cover?: boolean
  index?: number
  preload?: HTMLVideoElement['preload']
  sx?: SxProps
}

export const Video = memo(function Video(props: Props) {
  const { src, muted = false, loop = false, preload = 'metadata', index, cover, sx } = props
  const { event } = useNoteContext()
  const { autoPlay: contextAutoPlay } = useContentContext()
  const nevent = useNevent(event)
  const ref = useRef<HTMLVideoElement>(null)
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])

  const addMediaDim = useSetAtom(addMediaDimAtom)
  const setVideo = useSetAtom(setCurrentVideoAtom)
  const removeVideo = useSetAtom(removeCurrentVideoAtom)
  const currentVideo = useAtomValue(currentVideoAtom)
  const media = useMediaStore(src, event.metadata?.imeta, false)
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
        <LinkNEvent media block nevent={nevent} search={{ media: index }} sx={visibleOnHoverStyle.root}>
          <video
            {...css.props([styles.video, cover && styles.cover, blurStyles, sx])}
            playsInline
            role='button'
            webkit-playsinline='true'
            ref={ref}
            loop={loop}
            muted={autoPlay ? true : muted}
            autoPlay={false}
            preload={preload}
            controls={false}
            onLoadedMetadata={(e) => {
              const element = e.target as HTMLVideoElement
              addMediaDim({ src, dim: [element.videoWidth, element.videoHeight] })
            }}
            {...media}>
            <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
          </video>
          <VideoControls sx={styles.controls} ref={ref} />
        </LinkNEvent>
      )}
    </BlurContainer>
  )
})

const styles = css.create({
  video: {
    display: 'block',
    blockSize: 'auto',
    minWidth: 152,
    width: 'auto',
    height: 'inherit',
    maxWidth: 'inherit',
    maxHeight: 'inherit',
    backgroundColor: '#000',
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.lg,
    transition: 'transform 150ms ease',
    ':active': {
      transform: 'scale(0.985)',
    },
  },
  cover: {
    objectFit: 'cover',
  },
  controls: {
    borderBottomRightRadius: shape.lg,
    borderBottomLeftRadius: shape.lg,
  },
})
