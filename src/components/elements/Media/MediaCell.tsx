import { addMediaErrorAtom, mediaErrorsAtom } from '@/atoms/media.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
import { useImetaList, useNevent } from '@/hooks/useEventUtils'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { IconPhotoOff, IconSquaresFilled } from '@tabler/icons-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { BlurContainer } from '../Layouts/BlurContainer'
import { LinkNEvent } from '../Links/LinkNEvent'
import { UserAvatar } from '../User/UserAvatar'

type Props = {
  event: NostrEventDB
}

const MediaCellItem = memo(function MediaCellItem(props: {
  src: string
  type: 'image' | 'video'
  event: NostrEventDB
  index?: number
}) {
  const { type, src, event, index = 0 } = props
  const mobile = useMobile()
  const hasError = useAtomValue(mediaErrorsAtom).has(src)
  const addError = useSetAtom(addMediaErrorAtom)
  const imetaList = useImetaList(event)
  const nevent = useNevent(event)
  return (
    <html.div style={styles.item}>
      <LinkNEvent media block nevent={nevent} search={{ media: index }} sx={styles.item}>
        <BlurContainer>
          {({ blurStyles }) => (
            <>
              <html.div style={styles.header}>
                {imetaList.length > 1 && <IconSquaresFilled size={18} style={{ transform: 'scale(-1)' }} />}
              </html.div>
              <html.div style={styles.footer}>
                <Stack gap={1}>
                  <UserAvatar size='xs' pubkey={event.pubkey} sx={styles.avatar} />
                </Stack>
              </html.div>
              {!hasError && type === 'image' && (
                <html.img
                  onError={() => addError(src)}
                  src={getImgProxyUrl('feed_img', src)}
                  style={[styles.media, mobile && styles.media$mobile, blurStyles]}
                />
              )}
              {!hasError && type === 'video' && (
                <video
                  onError={() => addError(src)}
                  src={src}
                  {...css.props([styles.media, mobile && styles.media$mobile, blurStyles])}
                />
              )}
              {hasError && (
                <html.div style={styles.media$fallback}>
                  <Stack gap={1} horizontal={false} sx={styles.fallback} align='center' justify='center'>
                    <IconPhotoOff size={40} strokeWidth='1.0' />
                    {src}
                  </Stack>
                </html.div>
              )}
            </>
          )}
        </BlurContainer>
      </LinkNEvent>
    </html.div>
  )
})

export const MediaCell = memo(function MediaCell(props: Props) {
  const { event } = props
  const imetaList = useImetaList(event)
  useNoteState(event)
  return (
    <>
      <NoteProvider value={{ event }}>
        <ContentProvider value={{ dense: true }}>
          {imetaList.slice(0, 1).map(([type, src], index) => (
            <MediaCellItem key={src} type={type} src={src} event={event} index={index} />
          ))}
        </ContentProvider>
      </NoteProvider>
    </>
  )
})

const styles = css.create({
  item: {
    aspectRatio: '1 / 1',
    position: 'relative',
    transition: 'transform 150ms ease',
    ':active': { transform: 'scale(0.985)' },
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
