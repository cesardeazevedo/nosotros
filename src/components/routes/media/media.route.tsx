import { EditorMedia } from '@/components/elements/Editor/EditorMedia'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { MediaFeed } from '@/components/modules/Media/MediaFeed'
import { MediaFeedLayoutButtons } from '@/components/modules/Media/MediaFeedLayoutToggles'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import { useMediaModule } from '@/hooks/useMediaModule'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export const MediaRoute = observer(function MediaRoute() {
  const module = useMediaModule()
  const feed = module.feed
  useFeedSubscription(module.feed, module.contextWithFallback.client)
  return (
    <CenteredContainer margin>
      <PaperContainer>
        <Stack justify='space-between' sx={styles.header}>
          <div>
            <Text variant='title' size='lg'>
              Media
            </Text>
          </div>
          <MediaFeedLayoutButtons module={module} />
        </Stack>
        <Divider />
        <Stack horizontal={false} align='stretch' justify='space-between'>
          <EditorMedia initialOpen={false} store={module.editor} />
        </Stack>
        <Divider />
        <ContentProvider value={{ blured: feed.blured }}>
          <MediaFeed module={module} />
        </ContentProvider>
      </PaperContainer>
    </CenteredContainer>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding2,
  },
})
