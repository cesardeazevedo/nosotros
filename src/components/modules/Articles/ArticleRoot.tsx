import { LinkNAddress } from '@/components/elements/Links/LinkNAddress'
import { useNoteVisibility } from '@/components/elements/Posts/hooks/useNoteVisibility'
import { PostActions } from '@/components/elements/Posts/PostActions/PostActions'
import { PostHeaderDate } from '@/components/elements/Posts/PostHeaderDate'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { NoteProvider } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useMobile } from '@/hooks/useMobile'
import { useNoteStore } from '@/hooks/useNoteStore'
import { useGlobalSettings } from '@/hooks/useRootStore'
import type { NostrEventMetadata } from '@/nostr/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventMetadata
}

export const ArticleRoot = observer(function ArticleRoot(props: Props) {
  const globalSettings = useGlobalSettings()
  const { dense } = useContentContext()
  const note = useNoteStore(props.event)
  const { event } = note
  const [ref] = useNoteVisibility(event.event)
  const isMobile = useMobile()
  const title = event.getTag('title')
  const image = event.getTag('image')
  const summary = event.getTag('summary')
  const publishedAt = parseInt(event.getTag('published_at') || event.event.created_at.toString())
  return (
    <Stack horizontal={false} sx={styles.root} ref={ref}>
      <NoteProvider value={{ note }}>
        <LinkNAddress naddress={note.event.naddress}>
          <ContentProvider value={{ dense, disableLink: true }}>
            <Stack sx={styles.wrapper} align='center' gap={2}>
              <Stack grow gap={1} horizontal={false} sx={styles.content} align='flex-start'>
                <Stack horizontal={false} gap={2}>
                  <UserHeader pubkey={note.event.pubkey}>
                    <PostHeaderDate dateStyle='long' date={publishedAt} nevent={note.event.nevent} />
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
                {dense && <PostActions />}
              </Stack>
              {image && (
                <html.img
                  loading='lazy'
                  fetchPriority='low'
                  src={globalSettings.getImgProxyUrl('feed_img', image)}
                  style={[styles.image, isMobile && styles.image$mobile]}
                  onError={(e: { target: HTMLImageElement }) => {
                    setTimeout(() => {
                      const img = e.target
                      img.src = image
                    }, 1000)
                  }}
                />
              )}
            </Stack>
          </ContentProvider>
        </LinkNAddress>
        {!dense && <PostActions />}
      </NoteProvider>
    </Stack>
  )
})

const styles = css.create({
  root: {
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.03)',
    },
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
