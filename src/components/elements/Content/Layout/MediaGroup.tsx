import { useContentContext } from '@/components/providers/ContentProvider'
import { spacing } from '@/themes/spacing.stylex'
import type { ReactNode } from 'react'
import { type MutableRefObject, useRef } from 'react'
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

const MediaDraggable = (props: { children: ReactNode }) => {
  const { dense } = useContentContext()
  const ref = useRef<HTMLDivElement>(null)
  const { events } = useDraggable(ref as MutableRefObject<HTMLElement>, {
    applyRubberBandEffect: true,
  })
  return (
    <div {...css.props([styles.root, dense && styles.root$dense, styles.root$carousel])} {...events} ref={ref}>
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
  const { dense } = useContentContext()

  const length = 'children' in props ? props.length : props.media.length
  const isCarousel = length > 2
  const isPair = length == 2

  if (!isCarousel) {
    return (
      <>
        <html.div style={[styles.root, isPair && styles.root$pair, dense && styles.root$dense]}>
          {'children' in props ? props.children : <MediaList {...props} />}
        </html.div>
      </>
    )
  }

  return <MediaDraggable>{'children' in props ? props.children : <MediaList {...props} />}</MediaDraggable>
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
