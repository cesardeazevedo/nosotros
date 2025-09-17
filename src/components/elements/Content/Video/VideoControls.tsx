import { setCurrentVideoAtom } from '@/atoms/media.atoms'
import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconMaximize, IconPictureInPicture } from '@tabler/icons-react'
import { useSetAtom } from 'jotai'
import type { ChangeEvent, SyntheticEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { IconPause } from '../../Icons/IconPause'
import { IconPlay } from '../../Icons/IconPlay'
import { IconVolume } from '../../Icons/IconVolume'
import { IconVolumeOff } from '../../Icons/IconVolumeOff'

type Props = {
  ref: React.RefObject<HTMLVideoElement | null>
}

const iconProps = {
  size: 22,
  strokeWidth: '2.0',
  color: 'white',
}

export const VideoControls = function VideoControls(props: Props) {
  const { ref } = props
  const video = ref.current
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const progressFillRef = useRef<HTMLDivElement>(null)
  const progressThumbRef = useRef<HTMLDivElement>(null)
  const progressThumbOuterRef = useRef<HTMLDivElement>(null)
  const timeDisplayRef = useRef<HTMLDivElement>(null)

  const setVideo = useSetAtom(setCurrentVideoAtom)

  useEffect(() => {
    if (!video) return

    setDuration(video.duration || 0)
    setVolume(video.volume)
    setIsPlaying(!video.paused)
    setIsMuted(video.muted)

    let animationId: number

    const updateProgress = () => {
      const currentTime = video.currentTime
      const progressPercent = duration ? (currentTime / duration) * 100 : 0

      if (progressFillRef.current) {
        progressFillRef.current.style.width = `${progressPercent}%`
      }

      if (progressThumbRef.current) {
        progressThumbRef.current.style.left = `${progressPercent}%`
      }
      if (progressThumbOuterRef.current) {
        progressThumbOuterRef.current.style.left = `${progressPercent}%`
      }

      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`
      }

      animationId = requestAnimationFrame(updateProgress)
    }

    const updateDuration = () => setDuration(video.duration)
    const updateVolume = () => setVolume(video.volume)
    const updatePlaying = () => setIsPlaying(!video.paused)
    const updateMuted = () => setIsMuted(video.muted)

    animationId = requestAnimationFrame(updateProgress)

    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('volumechange', updateVolume)
    video.addEventListener('play', updatePlaying)
    video.addEventListener('pause', updatePlaying)
    video.addEventListener('volumechange', updateMuted)

    return () => {
      cancelAnimationFrame(animationId)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('volumechange', updateVolume)
      video.removeEventListener('play', updatePlaying)
      video.removeEventListener('pause', updatePlaying)
      video.removeEventListener('volumechange', updateMuted)
    }
  }, [video, duration])

  useEffect(() => {
    if (!containerRef.current || !timeDisplayRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry && timeDisplayRef.current) {
        timeDisplayRef.current.style.display = entry.contentRect.width < 300 ? 'none' : 'block'
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handleProgressClick = useCallback(
    (event: Readonly<{ pageX: number; preventDefault: () => void; stopPropagation: () => void }>) => {
      if (!progressRef.current || !duration || !video) return

      event.preventDefault()
      event.stopPropagation()

      const rect = progressRef.current.getBoundingClientRect()
      const percent = (event.pageX - rect.left) / rect.width
      const time = percent * duration
      video.currentTime = time
    },
    [video, duration],
  )

  const handleMouseDown = useCallback(
    (event: Readonly<{ pageX: number; preventDefault: () => void; stopPropagation: () => void }>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(true)
      handleProgressClick(event)
    },
    [handleProgressClick],
  )

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !progressRef.current || !duration || !video) return

      const rect = progressRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (event.pageX - rect.left) / rect.width))
      const time = percent * duration
      video.currentTime = time
    },
    [isDragging, video, duration],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleVolumeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (video) {
        video.muted = false
        video.volume = parseFloat(e.target.value)
      }
    },
    [video],
  )

  const handleTogglePlay = useCallback(() => {
    if (video) {
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
      setVideo({ video, play: !video.paused })
    }
  }, [video])

  const handleToggleMute = useCallback(() => {
    if (video) {
      video.muted = !video.muted
      if (video.volume === 0 && !video.muted) {
        video.volume = 1
      }
    }
  }, [video])

  const handleFullscreen = useCallback(() => {
    if (video) {
      video.requestFullscreen()
    }
  }, [video])

  const handlePictureInPicture = useCallback(() => {
    if (video) {
      video.requestPictureInPicture()
    }
  }, [video])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Needed because of lightbox, dragging the range down is dragging the lightbox video down
  const cancelEvent = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <html.div
      ref={containerRef}
      style={[styles.container, (isPlaying || (video?.currentTime || 0) === 0) && visibleOnHoverStyle.item]}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}>
      <html.div
        ref={progressRef}
        style={styles.progressContainer}
        onClick={handleProgressClick}
        onPointerMove={cancelEvent}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}>
        <html.div style={[styles.progressTrack, isHovering && styles.progressTrackHover]}>
          <html.div ref={progressFillRef} style={styles.progressFill} />
          <html.div ref={progressThumbOuterRef} style={styles.progressThumbOuter} />
          <html.div ref={progressThumbRef} style={[styles.progressThumb, isHovering && styles.progressThumbVisible]} />
        </html.div>
      </html.div>
      <Stack gap={1} justify='space-between'>
        <IconButton sx={styles.button} onClick={handleTogglePlay}>
          {isPlaying ? <IconPause color='white' /> : <IconPlay color='white' />}
        </IconButton>
        <html.div ref={timeDisplayRef} style={styles.timeDisplay}>
          0:00 / 0:00
        </html.div>
        <html.div style={styles.spacer} />
        <Stack gap={0.5}>
          <TooltipRich
            enterDelay={0}
            placement='top'
            content={() => (
              <html.div style={styles.sliderContainer}>
                <input
                  type='range'
                  aria-label='Volume Slider'
                  min={0}
                  max={1}
                  step={0.01}
                  {...css.props(styles.slider)}
                  value={isMuted ? 0 : volume}
                  onPointerMove={cancelEvent}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleVolumeChange(e)
                  }}
                  style={{ '--progress': `${isMuted ? 0 : volume * 100}%` } as React.CSSProperties}
                />
              </html.div>
            )}>
            <IconButton sx={styles.button} onClick={handleToggleMute}>
              {isMuted || volume === 0 ? <IconVolumeOff color='white' /> : <IconVolume color='white' />}
            </IconButton>
          </TooltipRich>
          <IconButton sx={styles.button} onClick={handlePictureInPicture}>
            <IconPictureInPicture {...iconProps} />
          </IconButton>
          <IconButton sx={styles.button} onClick={handleFullscreen}>
            <IconMaximize {...iconProps} />
          </IconButton>
        </Stack>
      </Stack>
    </html.div>
  )
}

const styles = css.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
    transition: 'opacity 200ms ease',
    padding: spacing['padding0.5'],
    paddingInline: 10,
    paddingBottom: 8,
    cursor: 'default',
    pointerEvents: 'auto',
  },
  progressContainer: {
    width: '100%',
    height: 20,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    // marginBottom: spacing['margin0.5'],
  },
  progressTrack: {
    position: 'relative',
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'visible',
    transition: 'height 150ms ease',
  },
  progressTrackHover: {
    height: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    width: '0%',
    borderRadius: 2,
  },
  progressThumbOuter: {
    position: 'absolute',
    top: -13,
    left: '0%',
    width: 30,
    height: 30,
    zIndex: 5,
    backgroundColor: 'transparent',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    transformOrigin: 'center',
    transition: 'background-color 150ms ease',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    left: '0%',
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: '50%',
    transform: 'translateX(-50%) scale(0)',
    transformOrigin: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    transition: 'transform 150ms ease',
  },
  progressThumbVisible: {
    transform: 'translateX(-50%) scale(1)',
  },
  button: {
    width: 32,
    height: 32,
    minWidth: 32,
    minHeight: 32,
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  timeDisplay: {
    color: 'white',
    whiteSpace: 'nowrap',
    fontSize: 14,
    fontWeight: 500,
    userSelect: 'all',
  },
  spacer: {
    flex: 1,
  },
  sliderContainer: {
    width: '75%',
    borderRadius: shape.lg,
    padding: spacing['padding0.5'],
    paddingInline: spacing.padding2,
    marginLeft: 22,
    marginBottom: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    color: 'white',
    transform: 'rotateZ(-90deg)',
    zIndex: 1000,
  },
  slider: {
    position: 'relative',
    appearance: 'none',
    width: '100%',
    height: 6,
    marginBottom: 8,
    borderRadius: '3px',
    background: `linear-gradient(to right, white 0%, white var(--progress), rgba(255, 255, 255, 0.3) var(--progress), rgba(255, 255, 255, 0.3) 100%)`,
    outline: 'none',
    '::-webkit-slider-thumb': {
      appearance: 'none',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'white',
      cursor: 'pointer',
      border: 'none',
      position: 'relative',
      transition: 'transform 0.1s ease',
      ':hover': {
        transform: 'scale(1.1)',
      },
      ':active': {
        transform: 'scale(0.95)',
      },
    },
    '::-moz-range-thumb': {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'white',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    '::-webkit-slider-track': {
      appearance: 'none',
    },
    '::-moz-range-track': {
      background: 'transparent',
    },
  },
})
