import { LinkNAddress } from '@/components/elements/Links/LinkNAddress'
import { PostActions } from '@/components/elements/Posts/PostActions/PostActions'
import { PostHeaderDate } from '@/components/elements/Posts/PostHeaderDate'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
import { useEventTag } from '@/hooks/useEventUtils'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { getImgProxyUrl } from '@/utils/imgproxy'
import type { NAddr } from 'nostr-tools/nip19'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
  border?: boolean
}

export const ArticleRoot = memo(function ArticleRoot(props: Props) {
  const note = useNoteState(props.event)
  const { dense } = useContentContext()
  const { event } = note
  const isMobile = useMobile()
  const title = useEventTag(event, 'title')
  const image = useEventTag(event, 'image')
  const summary = useEventTag(event, 'summary')
  const publishedAt = parseInt(useEventTag(event, 'published_at') || event.created_at.toString())
  return (
    <Stack horizontal={false} sx={[styles.root, props.border && styles.root$border]} ref={note.ref}>
      <NoteProvider value={{ event }}>
        <LinkNAddress naddress={note.nip19 as NAddr}>
          <ContentProvider value={{ dense, disableLink: true }}>
            <Stack sx={styles.wrapper} align='center' gap={2}>
              <Stack grow gap={1} horizontal={false} sx={styles.content} align='flex-start'>
                <Stack horizontal={false} gap={2}>
                  <UserHeader pubkey={note.event.pubkey}>
                    <PostHeaderDate dateStyle='long' nevent={note.nip19} date={publishedAt} />
                  </UserHeader>
                  <Text variant='headline' size='sm'>
                    {title}
                  </Text>
                  {summary && (
                    <Text variant='body' size='md'>
                      {summary}
                    </Text>
                  )}
                </Stack>
                {dense && <PostActions note={note} />}
              </Stack>
              {image && (
                <html.img
                  loading='lazy'
                  fetchPriority='low'
                  src={getImgProxyUrl('feed_img', image)}
                  style={[styles.image, isMobile && styles.image$mobile]}
                />
              )}
            </Stack>
          </ContentProvider>
        </LinkNAddress>
        {!dense && <PostActions note={note} />}
      </NoteProvider>
    </Stack>
  )
})

const styles = css.create({
  root: {
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.08)',
    },
  },
  root$border: {
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
  },
  wrapper: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  content: {
    paddingTop: spacing.padding1,
    overflow: 'hidden',
  },
  image: {
    objectFit: 'cover',
    width: 170,
    height: 150,
    marginTop: spacing.margin1,
    marginBottom: 0,
    borderRadius: shape.lg,
  },
  image$mobile: {
    width: 120,
    height: 100,
  },
  topic: {
    paddingInline: spacing.padding1,
    paddingBlock: '2px',
    backgroundColor: palette.surfaceContainer,
    borderRadius: shape.full,
    fontSize: '90%',
  },
})
