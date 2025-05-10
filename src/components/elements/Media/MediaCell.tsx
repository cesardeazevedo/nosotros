import { ContentProvider } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useNoteStore } from '@/hooks/useNoteStore'
import { useGlobalSettings } from '@/hooks/useRootStore'
import type { NostrEventMetadata } from '@/nostr/types'
import { mediaStore } from '@/stores/media/media.store'
import type { Note } from '@/stores/notes/note'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPhotoOff, IconSquaresFilled } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'

type Props = {
  event: NostrEventMetadata
}

const MediaCellItem = observer(function MediaCellItem(props: { src: string; type: 'image' | 'video'; note: Note }) {
  const { type, src, note } = props
  const globalSettings = useGlobalSettings()
  const mobile = useMobile()
  const hasError = mediaStore.hasError(src)
  return (
    <html.div key={src} style={styles.item}>
      <html.div style={styles.header}>
        {note.imetaList.length > 1 && <IconSquaresFilled size={18} style={{ transform: 'scale(-1)' }} />}
      </html.div>
      <html.div style={styles.footer}>
        <Stack gap={1}>
          <UserAvatar size='xs' pubkey={note.event.pubkey} sx={styles.avatar} />
        </Stack>
      </html.div>
      {!hasError && type === 'image' && (
        <html.img
          onClick={() => dialogStore.pushImage(note, src)}
          onError={() => mediaStore.addError(src)}
          src={globalSettings.getImgProxyUrl('feed_img', src)}
          style={[styles.media, mobile && styles.media$mobile]}
        />
      )}
      {!hasError && type === 'video' && (
        <video
          onClick={() => dialogStore.pushImage(note, src)}
          onError={() => mediaStore.addError(src)}
          src={src}
          {...css.props([styles.media, mobile && styles.media$mobile])}
        />
      )}
      {mediaStore.hasError(src) && (
        <html.div style={styles.media$fallback}>
          <Stack gap={1} horizontal={false} sx={styles.fallback} align='center' justify='center'>
            <IconPhotoOff size={40} strokeWidth='1.0' />
            {src}
          </Stack>
        </html.div>
      )}
    </html.div>
  )
})

export const MediaCell = observer(function MediaCell(props: Props) {
  const { event } = props
  const note = useNoteStore(event)
  return (
    <>
      <NoteProvider value={{ note }}>
        <ContentProvider value={{ dense: true }}>
          {note.imetaList.slice(0, 1).map(([type, src]) => (
            <MediaCellItem key={src} type={type} src={src} note={note} />
          ))}
        </ContentProvider>
      </NoteProvider>
    </>
  )
})

const styles = css.create({
  item: {
    flex: '1 1 calc(33.33% - 20px)',
    aspectRatio: '1 / 1',
    position: 'relative',
  },
  avatar: {},
  media: {
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'relative',
    backgroundColor: palette.surfaceContainerLow,
  },
  media$mobile: {},
  media$fallback: {
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'relative',
    display: 'flex',
    backgroundColor: palette.surfaceContainerLow,
  },
  fallback: {
    textAlign: 'center',
    wordBreak: 'break-all',
    paddingInline: spacing.padding1,
    backgroundColor: palette.surfaceContainer,
    color: palette.onSurfaceVariant,
  },
  header: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 200,
    color: 'white',
  },
  footer: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    zIndex: 200,
    color: 'white',
  },
})
