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
  const video = ref ? ref.current : null
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
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
      <Stack gap={1}>
        <IconButton sx={styles.button} onClick={handleTogglePlay}>
          {isPlaying ? (
            <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' color='white'>
              <path fill='currentColor' d='M14 19V5h4v14zm-8 0V5h4v14z' />
            </svg>
          ) : (
            <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' color='white'>
              <path fill='currentColor' d='M8 19V5l11 7z' />
            </svg>
          )}
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
              {isMuted || volume === 0 ? (
                <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' color='white'>
                  <path
                    fill='currentColor'
                    d='M16.775 19.575q-.275.175-.55.325t-.575.275q-.375.175-.762 0t-.538-.575q-.15-.375.038-.737t.562-.538q.1-.05.188-.1t.187-.1L12 14.8v2.775q0 .675-.612.938T10.3 18.3L7 15H4q-.425 0-.712-.288T3 14v-4q0-.425.288-.712T4 9h2.2L2.1 4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l17 17q.275.275.275.7t-.275.7t-.7.275t-.7-.275zm2.225-7.6q0-2.075-1.1-3.787t-2.95-2.563q-.375-.175-.55-.537t-.05-.738q.15-.4.538-.575t.787 0Q18.1 4.85 19.55 7.05T21 11.975q0 .825-.15 1.638t-.425 1.562q-.2.55-.612.688t-.763.012t-.562-.45t-.013-.75q.275-.65.4-1.312T19 11.975m-4.225-3.55Q15.6 8.95 16.05 10t.45 2v.25q0 .125-.025.25q-.05.325-.35.425t-.55-.15L14.3 11.5q-.15-.15-.225-.337T14 10.775V8.85q0-.3.263-.437t.512.012M9.75 6.95Q9.6 6.8 9.6 6.6t.15-.35l.55-.55q.475-.475 1.087-.213t.613.938V8q0 .35-.3.475t-.55-.125z'
                  />
                </svg>
              ) : (
                <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' color='white'>
                  <path
                    fill='currentColor'
                    d='M19 11.975q0-2.075-1.1-3.787t-2.95-2.563q-.375-.175-.55-.537t-.05-.738q.15-.4.538-.575t.787 0Q18.1 4.85 19.55 7.063T21 11.974t-1.45 4.913t-3.875 3.287q-.4.175-.788 0t-.537-.575q-.125-.375.05-.737t.55-.538q1.85-.85 2.95-2.562t1.1-3.788M7 15H4q-.425 0-.712-.288T3 14v-4q0-.425.288-.712T4 9h3l3.3-3.3q.475-.475 1.088-.213t.612.938v11.15q0 .675-.612.938T10.3 18.3zm9.5-3q0 1.05-.475 1.988t-1.25 1.537q-.25.15-.513.013T14 15.1V8.85q0-.3.263-.437t.512.012q.775.625 1.25 1.575t.475 2'
                  />
                </svg>
              )}
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
