import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { useMinHeightFromSources } from '@/hooks/useMediaStore'
import { spacing } from '@/themes/spacing.stylex'
import { type MutableRefObject, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { useDraggable } from 'react-use-draggable-scroll'
import { Image } from '../Image/Image'
import { Video } from '../Video/Video'
import { MediaWrapper } from './MediaWrapper'

type Props = {
  media: Array<{ index: number; src: string; type: 'image' | 'video' }>
}

export const MediaGroup = (props: Props) => {
  const { media } = props
  const ref = useRef<HTMLDivElement>(null)
  const { event } = useNoteContext()
  const { dense } = useContentContext()

  // @ts-ignore
  const { events } = useDraggable(ref as MutableRefObject<HTMLElement>, {
    applyRubberBandEffect: true,
  })

  const isMultiple = media.length > 1

  const minHeight = useMinHeightFromSources(
    media.map((x) => x.src),
    event,
  )

  return (
    <ContentProvider value={{ dense: true }}>
      <div {...css.props([styles.root, dense && styles.root$dense])} {...events} ref={ref}>
        {media.map(({ type, src, index }) => {
          return (
            <html.div key={src} style={styles.item}>
              <MediaWrapper size='sm' src={src} fixedHeight={minHeight}>
                {type === 'image' && (
                  <Image draggable={false} src={src} sx={isMultiple && styles.mediaMultiple} index={index} />
                )}
                {type === 'video' && (
                  <Video
                    preload='auto'
                    src={src}
                    sx={[isMultiple && styles.mediaMultiple, minHeight ? styles.bounds(minHeight) : false]}
                    index={index}
                  />
                )}
              </MediaWrapper>
            </html.div>
          )
        })}
      </div>
    </ContentProvider>
  )
}

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    height: '100%',
    overflowX: 'auto',
    paddingInline: spacing.padding2,
    paddingBlock: 4,
    '::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    scrollbarWidth: 0,
  },
  root$dense: {
    paddingInline: 0,
  },
  mediaMultiple: {
    height: '100%',
    width: 'auto',
  },
  item: {
    userSelect: 'none',
    userDrag: 'none',
    width: 'fit-content',
    height: 'fit-content',
  },
  bounds: (height: number) => ({
    height,
  }),
})
