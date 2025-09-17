import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { useMinHeightFromSources } from '@/hooks/useMediaStore'
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
      caroussel: boolean
    }

const MediaDraggable = (props: { children: ReactNode }) => {
  const { dense } = useContentContext()
  const ref = useRef<HTMLDivElement>(null)
  const { events } = useDraggable(ref as MutableRefObject<HTMLElement>, {
    applyRubberBandEffect: true,
  })
  return (
    <div {...css.props([styles.root, dense && styles.root$dense])} {...events} ref={ref}>
      {props.children}
    </div>
  )
}

const MediaList = (props: MediaProps) => {
  const { media } = props
  const { event } = useNoteContext()
  const minHeight = useMinHeightFromSources(
    media.map((x) => x.src),
    event,
  )
  const isMultiple = media.length > 1
  const isCarousell = media.length > 2
  return (
    <>
      {media.map(({ type, src, index }) => {
        return (
          <MediaWrapper
            key={src}
            fixed={isCarousell}
            event={event}
            size='sm'
            src={src}
            fixedHeight={isCarousell ? minHeight : undefined}
            sx={styles.wrapper}>
            {type === 'image' && (
              <Image
                cover={isMultiple}
                draggable={false}
                src={src}
                sx={[isMultiple && styles.multiple]}
                index={index}
              />
            )}
            {type === 'video' && <Video preload='auto' src={src} sx={[isMultiple && styles.multiple]} index={index} />}
          </MediaWrapper>
        )
      })}
    </>
  )
}

export const MediaGroup = (props: Props) => {
  const { dense } = useContentContext()

  const caroussel = 'children' in props ? props.caroussel : props.media.length > 2

  if (!caroussel) {
    return (
      <ContentProvider value={{ dense: true }}>
        <html.div style={[styles.root, styles.pair, dense && styles.root$dense]}>
          {'children' in props ? props.children : <MediaList {...props} />}
        </html.div>
      </ContentProvider>
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
  },
  pair: {
    gridTemplateColumns: '1fr 1fr',
  },
  root$dense: {
    paddingInline: 0,
  },
  wrapper: {
    height: '100%',
    width: '100%',
    marginInline: 0,
  },
  multiple: {
    height: '100%',
    width: '100%',
  },
})
