import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useMobile } from '@/hooks/useMobile'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useMatchRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'

export const ArticleHeadline = observer(function ArticleHeadline() {
  const { note } = useNoteContext()
  const globalSettings = useGlobalSettings()
  const match = useMatchRoute()
  const isDeck = match({ to: '/deck/$id' })
  const isMobile = useMobile()
  const { event } = note
  const title = event.getTag('title')
  const image = event.getTag('image')
  const summary = event.getTag('summary')
  return (
    <Stack horizontal={false} sx={styles.root} gap={1}>
      {image && (
        <html.img
          src={globalSettings.getImgProxyUrl('feed_img', image)}
          style={[styles.banner, !isDeck && styles.banner$round, isMobile && styles.banner$mobile]}
        />
      )}
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
})

const styles = css.create({
  root: {},
  content: {
    paddingTop: spacing.padding4,
    paddingBottom: spacing.padding2,
    paddingInline: spacing.padding2,
  },
  banner: {
    objectFit: 'cover',
    maxHeight: 350,
    width: '100%',
  },
  banner$round: {
    borderTopLeftRadius: shape.lg,
    borderTopRightRadius: shape.lg,
  },
  banner$mobile: {
    borderRadius: 0,
  },
  summary: {
    fontWeight: 300,
    color: palette.onSurfaceVariant,
  },
})
