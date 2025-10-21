import { TextClamped } from '@/components/elements/Content/TextClamped'
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
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
  header?: React.ReactNode
  border?: boolean
}

export const ArticleFeedItem = memo(function ArticleFeedItem(props: Props) {
  const note = useNoteState(props.event)
  const { dense } = useContentContext()
  const { event } = note
  const isMobile = useMobile()
  const title = useEventTag(event, 'title')
  const image = useEventTag(event, 'image')
  const summary = useEventTag(event, 'summary')
  return (
    <Stack horizontal={false} sx={[styles.root, props.border && styles.root$border]}>
      <NoteProvider value={{ event }}>
        <LinkNAddress naddress={note.nip19 as NAddr}>
          <ContentProvider value={{ dense, disableLink: true }}>
            <Stack sx={styles.wrapper} align='center' gap={2}>
              <Stack grow gap={1} horizontal={false} sx={styles.content} align='flex-start'>
                <Stack horizontal={false} gap={2}>
                  {props.header || (
                    <UserHeader pubkey={note.event.pubkey}>
                      <PostHeaderDate dateStyle='long' nevent={note.nip19} date={event.created_at} />
                    </UserHeader>
                  )}
                  <Text variant='headline' size='sm'>
                    {title}
                  </Text>
                  {summary && (
                    <TextClamped>
                      <Text variant='body' size='md' sx={styles.summary}>
                        {summary}
                      </Text>
                    </TextClamped>
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
    paddingBottom: spacing.padding1,
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding1,
  },
  content: {
    paddingTop: spacing.padding1,
    overflow: 'hidden',
  },
  summary: {},
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
