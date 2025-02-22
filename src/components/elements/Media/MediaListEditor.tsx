import { ContentProvider } from '@/components/providers/ContentProvider'
import type { UploadStore } from '@/stores/editor/upload.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import type { ImageAttributes, VideoAttributes } from 'nostr-editor'
import { type MutableRefObject, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { useDraggable } from 'react-use-draggable-scroll'
import { ImageEditor } from '../Content/Image/ImageEditor'
import { VideoEditor } from '../Content/Video/VideoEditor'

type Props = {
  uploadStore: UploadStore
}

export const MediaListEditor = observer(function MediaListEditor(props: Props) {
  const { uploadStore } = props
  const ref = useRef<HTMLDivElement>(null)
  // @ts-ignore
  const { events } = useDraggable(ref as MutableRefObject<HTMLElement>, {
    applyRubberBandEffect: true,
  })
  return (
    <ContentProvider value={{ dense: true }}>
      <html.div style={styles.root1}>
        <div {...css.props(styles.root)} {...events} ref={ref}>
          {uploadStore.files.map((file, index) => (
            <html.div key={file.src} style={styles.itemWrap}>
              {file.file.type.startsWith('image') && (
                <ImageEditor
                  {...(file as ImageAttributes)}
                  sx={styles.item}
                  onDelete={() => uploadStore.delete(index)}
                  onUpdate={(attrs) => uploadStore.setFileData(file.src, attrs)}
                />
              )}
              {file.file.type.startsWith('video') && (
                <VideoEditor
                  {...(file as VideoAttributes)}
                  sx={styles.item}
                  onDelete={() => uploadStore.delete(index)}
                  onUpdate={(attrs) => uploadStore.setFileData(file.src, attrs)}
                />
              )}
            </html.div>
          ))}
        </div>
      </html.div>
    </ContentProvider>
  )
})

const styles = css.create({
  root1: {
    overflowX: 'scroll',
    overflowY: 'hidden',
  },
  root: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.margin1,
    width: 'max-content',
    overflowY: 'hidden',
    marginBottom: spacing.margin1,
    paddingBottom: 4,
  },
  mediaMultiple: {
    maxHeight: 310,
  },
  itemWrap: {
    width: 'fit-content',
    height: 'fit-content',
    //maxHeight: 300,
    position: 'relative',
    userSelect: 'none',
    userDrag: 'none',
  },
  item: {
    height: 290,
    objectFit: 'cover',
  },
})
