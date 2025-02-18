import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import { useTagModule } from '@/hooks/useTagModule'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronUp, IconHash } from '@tabler/icons-react'
import { useParams } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { css } from 'react-strict-dom'

export const TagsRoute = observer(function TagsRoute() {
  const { delay } = useContext(DeckContext)
  const params = useParams({ from: '/tag/$tag' })
  const module = useTagModule(params.tag)
  const { feed } = module
  useFeedSubscription(feed, module.contextWithFallback.context)
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <CenteredContainer margin>
        <PaperContainer>
          <Stack sx={styles.header} justify='space-between'>
            <Stack gap={2}>
              <IconHash />
              {module.tags.map((tag) => (
                <Chip key={tag} label={`#${tag}`} />
              ))}
            </Stack>
            <Button variant='filledTonal' onClick={() => setExpanded((prev) => !prev)}>
              <Stack gap={0.5}>
                {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                Settings
              </Stack>
            </Button>
          </Stack>
          <Expandable expanded={expanded}>
            <FeedSettings feed={feed} />
          </Expandable>
          <Divider />
          <>
            <PostAwait promise={delay}>
              <FeedList
                feed={feed}
                onScrollEnd={feed.paginate}
                render={(event) => <NostrEventFeedItem event={event} />}
                footer={<PostLoading rows={8} />}
              />
            </PostAwait>
          </>
        </PaperContainer>
      </CenteredContainer>
    </>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding2,
  },
})
