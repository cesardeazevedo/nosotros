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

type Props = {
  note: Note
}

export const ArticleRoot = observer(function ArticleRoot(props: Props) {
  const { note } = props
  const { tags } = note.metadata
  const globalSettings = useGlobalSettings()
  const title = tags.title?.[0][1]
  const summary = tags.summary?.[0][1]
  const publishedAt = parseInt(tags.published_at?.[0][1] || note.event.created_at.toString())
  const image = tags.image?.[0][1]
  return (
    <Stack sx={styles.root} align='center' gap={2}>
      <Stack grow gap={1} horizontal={false} sx={styles.content} align='flex-start'>
        <html.span style={styles.topic}>Article</html.span>
        <Stack horizontal={false}>
          <UserHeader pubkey={note.event.pubkey}>
            <PostHeaderDate dateStyle='long' date={publishedAt} nevent={note.nevent} />
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
        <PostActions note={note} dense />
      </Stack>
      {image && <html.img src={globalSettings.getImgProxyUrl('feed_img', image)} style={styles.image} />}
    </Stack>
  )
})

const styles = css.create({
  root: {
    paddingBlock: spacing.padding2,
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
    margin: 'auto',
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
