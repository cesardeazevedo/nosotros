import { addMediaErrorAtom, mediaErrorsAtom } from '@/atoms/media.atoms'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useEventTag } from '@/hooks/useEventUtils'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { useMatchRoute } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

export const ArticleHeadline = memo(function ArticleHeadline() {
  const { event } = useNoteContext()
  const match = useMatchRoute()
  const isDeck = match({ to: '/deck/$id' })
  const isMobile = useMobile()
  const title = useEventTag(event, 'title')
  const image = useEventTag(event, 'image')
  const summary = useEventTag(event, 'summary')
  const addError = useSetAtom(addMediaErrorAtom)
  const hasError = useAtomValue(mediaErrorsAtom).has(image || '')
  return (
    <Stack horizontal={false} sx={styles.root} gap={1}>
      {image && !hasError && (
        <html.img
          src={getImgProxyUrl('feed_img', image)}
          style={[styles.banner, !isDeck && styles.banner$round, isMobile && styles.banner$mobile]}
          onError={() => addError(image)}
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
