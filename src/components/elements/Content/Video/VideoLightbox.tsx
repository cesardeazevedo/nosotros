// from yet-another-react-light video plugin with adjustements and
// our custom video controls
import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  useLightboxProps,
  useContainerRect,
  useDocumentContext,
  useEventCallback,
  useEvents,
  clsx,
  cssClass,
  reflow,
  ACTIVE_SLIDE_COMPLETE,
  ACTIVE_SLIDE_LOADING,
  ACTIVE_SLIDE_PLAYING,
  CLASS_FLEX_CENTER,
  CLASS_SLIDE_WRAPPER,
  type PluginProps,
  type RenderSlideProps,
} from 'yet-another-react-lightbox'
import { VideoControls } from './VideoControls'
import { css } from 'react-strict-dom'
import { visibleOnHoverStyle } from '@/components/ui/helpers/visibleOnHover.stylex'

type VideoSource = {
  src: string
  type: string
  media?: string
}

export type VideoSlide = {
  type: 'video'
  poster?: string
  width?: number
  height?: number
  autoPlay?: boolean
  controls?: boolean
  controlsList?: string
  crossOrigin?: string
  preload?: string
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  disablePictureInPicture?: boolean
  disableRemotePlayback?: boolean
  sources: VideoSource[]
}

type VideoDefaults = {
  autoPlay?: boolean
  controls?: boolean
  controlsList?: string
  crossOrigin?: string
  preload?: string
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  disablePictureInPicture?: boolean
  disableRemotePlayback?: boolean
}

type WithVideoProp = {
  video?: VideoDefaults
}

function isVideoSlide(slide: unknown): slide is VideoSlide {
  if (slide && typeof slide === 'object') {
    const t = (slide as { type?: unknown }).type
    if (t === 'video') {
      const sources = (slide as { sources?: unknown }).sources
      return Array.isArray(sources)
    }
  }
  return false
}

const DEFAULTS: Required<Pick<VideoDefaults, 'controls' | 'playsInline'>> = {
  controls: true,
  playsInline: true,
}

function resolveVideoDefaults(video: VideoDefaults | undefined) {
  return { ...DEFAULTS, ...(video || {}) }
}

function useVideoDefaults() {
  const props = useLightboxProps() as unknown as WithVideoProp
  return resolveVideoDefaults(props.video)
}

function isChromium() {
  const uaData = (navigator as { userAgentData?: { brands: { brand: string }[] } }).userAgentData
  const brand = uaData?.brands?.some((b) => b.brand === 'Chromium') === true
  const chrome = !!(window as { chrome?: unknown }).chrome
  return brand || chrome
}

function isWebKit() {
  return /^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent)
}

type VideoSlideProps = {
  slide: VideoSlide
  offset: number
}

function VideoSlideView(props: VideoSlideProps) {
  const { slide, offset } = props
  const videoDefaults = useVideoDefaults()
  const { publish } = useEvents()
  const { setContainerRef, containerRect, containerRef } = useContainerRect()
  const { getOwnerDocument } = useDocumentContext()
  const { animation } = useLightboxProps()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const freezeNavigation = useRef(false)

  useEffect(() => {
    const el = videoRef.current
    if (offset !== 0 && el && !el.paused) {
      el.pause()
    }
  }, [offset])

  useEffect(() => {
    const el = videoRef.current
    const wantsAutoplay = !!(slide.autoPlay || videoDefaults.autoPlay)

    if (offset === 0 && el && wantsAutoplay) {
      publish(ACTIVE_SLIDE_LOADING)
      const p = el.play()
      if (typeof (p as unknown as Promise<void>)?.catch === 'function') {
        ;(p as unknown as Promise<void>).catch(() => {})
      }
    }
  }, [offset, slide.autoPlay, videoDefaults.autoPlay, publish])

  const fixupPlayerControls = useEventCallback(() => {
    const delay = Math.max(animation.swipe, animation.navigation || 0) + 50
    const id = setTimeout(() => {
      const container = containerRef.current
      if (container) {
        const prev = container.style.border
        container.style.border = '1px solid transparent'
        reflow(container)
        container.style.border = prev
      }
    }, delay)
    return () => clearTimeout(id)
  })

  useEffect(() => {
    if (isChromium() && offset === 0) {
      return fixupPlayerControls()
    }
  }, [offset, fixupPlayerControls])

  const handleVideoRef = useEventCallback((node: HTMLVideoElement) => {
    const wantsAutoplay = !!(videoDefaults.autoPlay || slide.autoPlay)
    const isActive = offset === 0
    if (isActive && wantsAutoplay && node.paused) {
      const p = node.play()
      if (typeof (p as unknown as Promise<void>)?.catch === 'function') {
        ;(p as unknown as Promise<void>).catch(() => {})
      }
    }
  })

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node
      if (node) {
        handleVideoRef(node)
      }
    },
    [handleVideoRef],
  )

  useEffect(() => {
    if (offset !== 0) {
      return
    }

    let fullscreen = false
    const doc = getOwnerDocument()

    const onChange = () => {
      fullscreen = doc.fullscreenElement === videoRef.current
      freezeNavigation.current = fullscreen
    }

    doc.addEventListener('fullscreenchange', onChange)
    return () => {
      doc.removeEventListener('fullscreenchange', onChange)
      if (fullscreen) {
        freezeNavigation.current = false
        doc.exitFullscreen().catch(() => {})
      }
    }
  }, [offset, getOwnerDocument])

  useEffect(() => {
    if (offset !== 0) {
      return
    }
    let pip = false
    const doc = getOwnerDocument()

    const track = (val: boolean) => {
      return (e: Event) => {
        if (e.target === videoRef.current) {
          pip = val
          freezeNavigation.current = val
        }
      }
    }

    const onEnter = track(true)
    const onLeave = track(false)

    doc.addEventListener('enterpictureinpicture', onEnter)
    doc.addEventListener('leavepictureinpicture', onLeave)

    return () => {
      doc.removeEventListener('enterpictureinpicture', onEnter)
      doc.removeEventListener('leavepictureinpicture', onLeave)
      if (pip) {
        freezeNavigation.current = false
        doc.exitPictureInPicture?.().catch(() => {})
      }
    }
  }, [offset, getOwnerDocument])

  const { width, height, poster, sources } = slide

  const scalingProps = useMemo(() => {
    const props: React.ComponentProps<'video'> = {}
    const style: React.CSSProperties = { maxWidth: '100%', maxHeight: '100vh' }
    props.style = style

    const hasDims = typeof width === 'number' && typeof height === 'number'
    const rect = containerRect

    if (hasDims && rect) {
      const widthBound = width / height > rect.width / rect.height
      let w = rect.width
      let h = rect.height

      if (widthBound) {
        w = rect.width
        h = Math.round((rect.width / width) * height)
      } else {
        h = rect.height
        w = Math.round((rect.height / height) * width)
      }

      props.width = w
      props.height = h
      style.width = w
      style.height = h
    }

    return props
  }, [containerRect, width, height])

  type BoolKeys =
    | 'controls'
    | 'playsInline'
    | 'loop'
    | 'muted'
    | 'disablePictureInPicture'
    | 'disableRemotePlayback'
    | 'autoPlay'

  type StrKeys = 'controlsList' | 'crossOrigin' | 'preload'

  const resolveBoolean = useCallback(
    (key: BoolKeys) => {
      const s = (slide as Record<string, unknown>)[key]
      if (s === false) return null
      if (s === true) return { [key]: true as const }

      const d = (videoDefaults as Record<string, unknown>)[key]
      if (d === false) return null
      if (d === true) return { [key]: true as const }

      return null
    },
    [slide, videoDefaults],
  )

  const resolveString = useCallback(
    (key: StrKeys) => {
      const s = (slide as Record<string, unknown>)[key]
      if (s != null) return { [key]: s as string }
      const d = (videoDefaults as Record<string, unknown>)[key]
      if (d != null) return { [key]: d as string }
      return null
    },
    [slide, videoDefaults],
  )

  const suppressWhenFrozen = useCallback((e: React.UIEvent) => {
    if (freezeNavigation.current) {
      e.stopPropagation()
    }
  }, [])

  if (!sources || sources.length === 0) {
    return null
  }

  const containerStyle: CSSProperties = { width: '100%', height: '100%' }
  if (typeof width === 'number') {
    containerStyle.maxWidth = `${width}px`
  }

  return (
    <div
      ref={setContainerRef}
      style={containerStyle}
      className={clsx(cssClass('video_container'), cssClass(CLASS_FLEX_CENTER), cssClass(CLASS_SLIDE_WRAPPER))}>
      {containerRect ? (
        <div
          {...css.props(visibleOnHoverStyle.root)}
          style={{
            position: 'relative',
            height: 'fit-content',
            width: 'fit-content',
            maxWidth: '100%',
            maxHeight: '100%',
          }}>
          <video
            ref={setVideoRef}
            poster={poster}
            {...scalingProps}
            {...resolveBoolean('controls')}
            {...resolveBoolean('playsInline')}
            {...resolveBoolean('loop')}
            {...resolveBoolean('muted')}
            {...resolveBoolean('disablePictureInPicture')}
            {...resolveBoolean('disableRemotePlayback')}
            {...resolveString('controlsList')}
            {...resolveString('crossOrigin')}
            {...resolveString('preload')}
            onPlay={() => {
              if (offset !== 0) {
                const el = videoRef.current
                if (el) el.pause()
                return
              }
              publish(ACTIVE_SLIDE_PLAYING)
            }}
            onEnded={() => {
              publish(ACTIVE_SLIDE_COMPLETE)
            }}
            onClick={() => {
              const el = videoRef.current
              if (el) {
                if (el.muted) {
                  el.muted = false
                  return
                }
                if (el.paused) {
                  el.play()
                } else {
                  el.pause()
                }
              }
            }}
            onWheel={suppressWhenFrozen}
            onKeyDown={suppressWhenFrozen}
            onPointerDown={(event) => {
              suppressWhenFrozen(event)
              if (isWebKit()) {
                const el = videoRef.current
                if (el) {
                  const rect = el.getBoundingClientRect()
                  const distance = rect.bottom - (event as React.PointerEvent).clientY
                  if (distance < 40) {
                    event.stopPropagation()
                  }
                }
              }
            }}>
            {sources.map((s) => {
              const key = [s.src, s.type, s.media].filter(Boolean).join('|')
              return <source key={key} src={s.src} type={s.type} media={s.media} />
            })}
          </video>
          <VideoControls ref={videoRef} />
        </div>
      ) : null}
    </div>
  )
}

export function VideoPlugin(props: PluginProps) {
  const { augment } = props

  augment((incoming) => {
    const prev = incoming.render?.slide

    function renderSlide(p: RenderSlideProps) {
      const { offset } = p
      const slide = p.slide as unknown

      if (isVideoSlide(slide)) {
        const key = slide.sources.map((s) => s.src).join('|')
        return <VideoSlideView key={key} slide={slide} offset={offset} />
      }

      if (prev) {
        return prev(p)
      }

      return undefined
    }

    return {
      ...incoming,
      render: {
        ...incoming.render,
        slide: renderSlide,
      },
    }
  })
}
