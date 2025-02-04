import { ContentProvider } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { spacing } from '@/themes/spacing.stylex'
import { type MutableRefObject, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { useDraggable } from 'react-use-draggable-scroll'
import { Image } from '../Content/Image/Image'
import { Video } from '../Content/Video/Video'

export const MediaList = () => {
  const { note } = useNoteContext()
  const ref = useRef<HTMLDivElement>(null)
  // @ts-ignore
  const { events } = useDraggable(ref as MutableRefObject<HTMLElement>, {
    applyRubberBandEffect: true,
  })
  const isMultiple = note.imetaList.length > 1
  return (
    <ContentProvider value={{ dense: true }}>
      <div {...css.props(styles.root)} {...events} ref={ref}>
        {note.imetaList.map(([type, src]) => (
          <html.div key={src} style={styles.item}>
            {type === 'image' && <Image draggable={false} src={src} sx={isMultiple && styles.mediaMultiple} />}
            {type === 'video' && <Video src={src} sx={isMultiple && styles.mediaMultiple} />}
          </html.div>
        ))}
      </div>
    </ContentProvider>
  )
}

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.margin1,
    width: '100%',
    overflowX: 'auto',
    paddingInline: spacing.padding2,
    paddingBlock: 4,
    '::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    scrollbarWidth: 0,
  },
  mediaMultiple: {
    maxHeight: 310,
  },
  item: {
    userSelect: 'none',
    userDrag: 'none',
  },
})
