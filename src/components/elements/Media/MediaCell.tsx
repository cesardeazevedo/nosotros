import { ContentProvider } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useMobile } from '@/hooks/useMobile'
import { useNoteStore } from '@/hooks/useNoteStore'
import { useGlobalSettings } from '@/hooks/useRootStore'
import type { NostrEventMedia } from '@/nostr/types'
import { mediaStore } from '@/stores/media/media.store'
import { dialogStore } from '@/stores/ui/dialogs.store'
import { palette } from '@/themes/palette.stylex'
import { IconSquaresFilled } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'

export const MediaCell = observer(function MediaCell(props: { event: NostrEventMedia }) {
  const { event } = props
  const note = useNoteStore(event)
  const globalSettings = useGlobalSettings()
  const mobile = useMobile()
  return (
    <>
      <NoteProvider value={{ note }}>
        <ContentProvider value={{ dense: true }}>
          {note.imetaList.slice(0, 1).map(([type, src]) => {
            return (
              <html.div key={src} style={styles.item}>
                <html.div style={styles.header}>
                  {note.imetaList.length > 1 && <IconSquaresFilled size={18} style={{ transform: 'scale(-1)' }} />}
                </html.div>
                <html.div style={styles.footer}>
                  <Stack gap={1}>
                    <UserAvatar size='xs' pubkey={event.pubkey} sx={styles.avatar} />
                  </Stack>
                </html.div>
                {type === 'image' && (
                  <html.img
                    onClick={() => dialogStore.pushImage(src)}
                    onError={() => mediaStore.addError(src)}
                    src={globalSettings.getImgProxyUrl('feed_img', src)}
                    style={[styles.media, mobile && styles.media$mobile]}
                  />
                )}
                {type === 'video' && (
                  <video
                    onClick={() => dialogStore.pushImage(src)}
                    onError={() => mediaStore.addError(src)}
                    src={globalSettings.getImgProxyUrl('feed_img', src)}
                    {...css.props([styles.media, mobile && styles.media$mobile])}
                  />
                )}
              </html.div>
            )
          })}
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
  avatar: {
    boxShadow: `0px 0px 0px 1px ${palette.surfaceContainerLowest}`,
  },
  media: {
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'relative',
  },
  media$mobile: {},
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
