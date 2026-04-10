import { useContentContext } from '@/components/providers/ContentProvider'
import { SxProps } from '@/components/ui/types'
import { spacing } from '@/themes/spacing.stylex'
import type { ReactNode } from 'react'
import { useRef, type MutableRefObject } from 'react'
import { css, html } from 'react-strict-dom'
import { useDraggable } from 'react-use-draggable-scroll'
import { Image } from '../Image/Image'
import { Video } from '../Video/Video'
import { MediaWrapper } from './MediaWrapper'

type MediaProps = {
  media: Array<{ index: number; src: string; type: 'image' | 'video' }>
}

type Props =
  | MediaProps
  | {
    // needed when rendering for different formats like files
    children: ReactNode
    length: number
  }

const MediaDraggable = (props: { sx?: SxProps, children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { events } = useDraggable(ref as MutableRefObject<HTMLElement>, {
    applyRubberBandEffect: true,
  })
  return (
    <div
      {...css.props([props.sx, styles.root$carousel])}
      {...events}
      ref={ref}
    >
      {props.children}
    </div>
  )
}

const MediaList = (props: MediaProps) => {
  const { media } = props
  const { dense } = useContentContext()
  const isPair = media.length == 2
  const isMultiple = media.length > 1
  const isCarousel = media.length > 2
  const mode = media.length == 1 ? (dense ? 'single_dense' : 'single') : isPair ? 'pair' : 'carousel'
  return (
    <>
      {media.map(({ type, src, index }) => {
        return (
          <MediaWrapper key={src} mode={mode} sx={styles.wrapper}>
            {type === 'image' && (
              <Image
                cover={isMultiple}
                draggable={false}
                src={src}
                sx={[isPair && styles.media$pair, isCarousel && styles.media$carousel]}
                index={index}
              />
            )}
            {type === 'video' && (
              <Video
                preload='auto'
                src={src}
                cover={isMultiple}
                sx={[isPair && styles.media$pair, isCarousel && styles.media$carousel]}
                index={index}
              />
            )}
          </MediaWrapper>
        )
      })}
    </>
  )
}

export const MediaGroup = (props: Props) => {
  const { dense, mediaObject } = useContentContext()

  const length = 'children' in props ? props.length : props.media.length
  const isCarousel = length > 2
  const isPair = length == 2
  const sx = [
    styles.root,
    mediaObject && styles.root$mediaObject,
    mediaObject && isCarousel && styles.root$MediaObjectCarousel,
    dense && styles.root$dense
  ]

  if (!isCarousel) {
    return (
      <>
        <html.div style={[sx, isPair && styles.root$pair]}>
          {'children' in props ? props.children : <MediaList {...props} />}
        </html.div>
      </>
    )
  }

  return <MediaDraggable sx={sx}>{'children' in props ? props.children : <MediaList {...props} />}</MediaDraggable>
}

const styles = css.create({
  root: {
    display: 'grid',
    gridAutoFlow: 'column',
    placeItems: 'center',
    gridAutoColumns: 'max-content',
    position: 'relative',
    gap: 6,
    width: '100%',
    height: '100%',
    overflowY: 'hidden',
    overflowX: 'auto',
    // border: '1px solid red',
    paddingInline: spacing.padding2,
    paddingBlock: 4,
    '::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    scrollbarWidth: 'none',
  },
  root$carousel: {
    paddingRight: spacing.padding6,
  },
  root$pair: {
    gridTemplateColumns: '1fr 1fr',
  },
  root$dense: {
    paddingInline: 0,
  },
  root$mediaObject: {
    paddingInline: 0,
  },
  root$MediaObjectCarousel: {
    marginTop: spacing.padding1,
    paddingLeft: 70,
    marginInlineStart: -72,
    width: 'calc(100% + 88px)',
  },
  wrapper: {
    height: '100%',
    marginInline: 0,
  },
  media$pair: {
    height: '100%',
    width: '100%',
  },
  media$carousel: {
    height: '100%',
  },
})
