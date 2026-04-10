import { TextClamped } from '@/components/elements/Content/TextClamped'
import { PostActions } from '@/components/elements/Posts/PostActions/PostActions'
import { PostHeader } from '@/components/elements/Posts/PostHeader'
import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useNoteState } from '@/hooks/state/useNote'
import { useEventTag } from '@/hooks/useEventUtils'
import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { getImgProxyUrl } from '@/utils/imgproxy'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
  header?: React.ReactNode
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
    <Stack horizontal={false} sx={styles.root}>
      <ContentProvider value={{ dense, disableLink: true }}>
        <Stack grow gap={1} horizontal={false} sx={styles.wrapper} align='flex-start'>
          <>
            <Paper outlined sx={styles.paper}>
              {image && (
                <html.img
                  loading='lazy'
                  fetchPriority='low'
                  src={getImgProxyUrl('feed_img', image)}
                  style={[styles.image, isMobile && styles.image$mobile]}
                />
              )}
              <Stack horizontal={false} gap={1} sx={styles.content}>
                <Text variant='headline' size='sm'>
                  {title}
                </Text>
                {summary && (
                  <TextClamped>
                    <Text variant='body' size='lg' sx={styles.summary}>
                      {summary}
                    </Text>
                  </TextClamped>
                )}
              </Stack>
            </Paper>
            {/* <PostActions note={note} /> */}
          </>
        </Stack>
      </ContentProvider>
    </Stack>
  )
})

const styles = css.create({
  root: {
    cursor: 'pointer',
  },
  wrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  paper: {
    marginTop: spacing.margin2,
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    width: '100%',
    padding: spacing.padding2,
  },
  summary: {},
  image: {
    width: '100%',
    objectFit: 'cover',
    maxHeight: 240,
    marginBottom: 0,
  },
  image$mobile: {
    width: 120,
    height: 100,
  },
})
