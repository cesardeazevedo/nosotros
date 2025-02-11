import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Stack } from '@/components/ui/Stack/Stack'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import type { TagModule } from '@/stores/modules/tag.module'
import { IconChevronDown, IconChevronUp, IconHash } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'

type Props = {
  module: TagModule
}

export const TagsColumn = observer(function TagsColumn(props: Props) {
  const { module } = props
  const { feed } = module
  const { delay } = useContext(DeckContext)
  useFeedSubscription(feed, module.contextWithFallback.context)
  return (
    <>
      <DeckColumnHeader
        id={module.id}
        settingsIcon={({ expanded, expand }) => (
          <Button variant='filledTonal' onClick={() => expand(!expanded)}>
            <Stack gap={0.5}>
              {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              Settings
            </Stack>
          </Button>
        )}
        settings={<FeedSettings feed={feed} />}>
        <Stack gap={2}>
          <IconHash />
          {module.tags.map((tag) => (
            <Chip key={tag} label={`#${tag}`} />
          ))}
        </Stack>
      </DeckColumnHeader>
      <>
        <PostAwait promise={delay}>
          <FeedList
            column
            feed={feed}
            onScrollEnd={feed.paginate}
            render={(event) => <NostrEventFeedItem event={event} />}
            footer={<PostLoading rows={8} />}
          />
        </PostAwait>
      </>
    </>
  )
})
