import { useNoteContext } from '@/components/providers/NoteProvider'
import type { SxProps } from '@/components/ui/types'
import { useMediaStore } from '@/hooks/useMediaStore'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { shape } from '@/themes/shape.stylex'
import { observer } from 'mobx-react-lite'
import { useMemo, useRef } from 'react'
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

export const Video = observer(function Video(props: Props) {
  const { src, controls = true, muted = false, loop = false, preload = 'metadata', sx } = props
  const { note } = useNoteContext()
  const ref = useRef<HTMLVideoElement>(null)
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])
  const media = useMediaStore(src, note.metadata.imeta)
  const settings = useGlobalSettings()
  const autoPlay = props.autoPlay ?? settings.autoPlay
  return (
    <BlurContainer>
      {({ blurStyles }) => (
        <video
          {...css.props([styles.video, blurStyles, sx])}
          ref={ref}
          loop={loop}
          muted={autoPlay ? true : muted}
          autoPlay={autoPlay}
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
    width: '100%',
    height: '100%',
    transition: 'transform 150ms ease',
    ':active': {
      transform: 'scale(0.985)',
    },
  },
})
