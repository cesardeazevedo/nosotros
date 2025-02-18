import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { css, html } from 'react-strict-dom'

export const ArticleHeader = () => {
  const { note } = useNoteContext()
  const globalSettings = useGlobalSettings()
  const title = note.event.tags.title?.[0][1] || ''
  const image = note.event.tags.image?.[0][1] || ''
  const summary = note.event.tags.summary?.[0][1] || ''
  return (
    <Stack horizontal={false} sx={styles.root} gap={1}>
      <html.img src={globalSettings.getImgProxyUrl('feed_img', image)} style={styles.banner} />
      <Stack horizontal={false} gap={1} sx={styles.content}>
        <Text variant='display' size='md'>
          {title}
        </Text>
        {summary && (
          <Text variant='title' size='lg' sx={styles.summary}>
            {summary}
          </Text>
        )}
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {},
  content: {
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding2,
  },
  banner: {
    objectFit: 'cover',
    maxHeight: 350,
    width: '100%',
    borderTopLeftRadius: shape.lg,
    borderTopRightRadius: shape.lg,
  },
  summary: {
    fontWeight: 300,
    color: palette.onSurfaceVariant,
  },
})
