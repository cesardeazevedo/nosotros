import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGlobalSettings } from '@/hooks/useRootStore'
import type { Note } from '@/stores/notes/note'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import { PostActions } from '../Posts/PostActions/PostActions'
import { PostHeaderDate } from '../Posts/PostHeaderDate'
import { UserHeader } from '../User/UserHeader'
import { LinkNAddress } from '../Links/LinkNAddress'

type Props = {
  note: Note
}

export const ArticleRoot = observer(function ArticleRoot(props: Props) {
  const globalSettings = useGlobalSettings()
  const { dense } = useNoteContext()
  const { note } = props
  const { tags } = note.metadata
  const title = tags.title?.[0][1]
  const image = tags.image?.[0][1]
  const summary = tags.summary?.[0][1]
  const publishedAt = parseInt(tags.published_at?.[0][1] || note.event.created_at.toString())
  return (
    <>
      <Stack sx={styles.root} align='center' gap={2}>
        <Stack grow gap={1} horizontal={false} sx={styles.content} align='flex-start'>
          <Stack horizontal={false} gap={2}>
            <UserHeader pubkey={note.event.pubkey}>
              <PostHeaderDate dateStyle='long' date={publishedAt} nevent={note.nevent} />
            </UserHeader>
            <LinkNAddress naddress={note.naddress}>
              <Text variant='headline' size='sm'>
                {title}
              </Text>
              {summary && (
                <Text variant='body' size='md'>
                  {summary}
                </Text>
              )}
            </LinkNAddress>
          </Stack>
          {dense && <PostActions note={note} />}
        </Stack>
        {image && <html.img src={globalSettings.getImgProxyUrl('feed_img', image)} style={styles.image} />}
      </Stack>
      {!dense && <PostActions note={note} />}
    </>
  )
})

const styles = css.create({
  root: {
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
  topic: {
    paddingInline: spacing.padding1,
    paddingBlock: '2px',
    backgroundColor: palette.surfaceContainer,
    borderRadius: shape.full,
    fontSize: '90%',
  },
})
