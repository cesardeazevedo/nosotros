import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { EditorMedia } from '@/components/elements/Editor/EditorMedia'
import { MediaSettings } from '@/components/elements/Media/MediaSettings'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import type { MediaModule } from '@/stores/modules/media.module'
import { IconPhoto } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { MediaFeed } from './MediaFeed'

type Props = {
  module: MediaModule
}

export const MediaColumn = observer(function MediaColumn(props: Props) {
  const { module } = props
  const { id } = module
  const feed = module.feed
  const { delay } = useContext(DeckContext)

  useFeedSubscription(feed, module.contextWithFallback.client)

  return (
    <>
      <DeckColumnHeader id={id} settings={<MediaSettings module={module} />}>
        <Stack gap={2}>
          <IconPhoto size={24} strokeWidth={'1.6'} />
          <Text variant='title' size='lg'>
            Media
          </Text>
        </Stack>
      </DeckColumnHeader>
      <ContentProvider value={{ blured: feed.blured }}>
        <PostAwait promise={delay}>
          <MediaFeed
            column
            module={module}
            header={
              <>
                <EditorMedia initialOpen={false} store={module.editor} />
                <Divider />
              </>
            }
          />
        </PostAwait>
      </ContentProvider>
    </>
  )
})
