import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { NostrProvider } from '@/components/providers/NostrProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Search } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useSearchModule } from '@/hooks/useSearchModule'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronLeft } from '@tabler/icons-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { useObservable, useObservableCallback, useSubscription } from 'observable-hooks'
import { css } from 'react-strict-dom'
import { mergeMap, tap, throttleTime } from 'rxjs'
import { SearchSettings } from './SearchSettings'

export const SearchRoute = observer(function SearchRoute() {
  const params = useSearch({ from: '/search' })
  const module = useSearchModule(params.q || '')
  const navigate = useNavigate()

  const feed = module?.feed

  const [onChange, query$] = useObservableCallback<string>((input$) => {
    return input$.pipe(
      throttleTime(1300, undefined, { leading: false, trailing: true }),
      tap((query) => navigate({ to: '/search', search: { q: query } })),
      tap((query) => module.setQuery(query)),
    )
  })
  useSubscription(query$)

  const sub = useObservable(
    (module$) => module$.pipe(mergeMap(([module]) => module.subscribe())),
    [module, getSnapshot(module.contextWithFallback)],
  )
  useSubscription(sub)

  return (
    <NostrProvider nostrContext={() => module.context!} subFollows={false}>
      <CenteredContainer margin>
        <Stack gap={1}>
          <IconButton onClick={() => navigate({ to: '/' })}>
            <IconChevronLeft />
          </IconButton>
          <Text variant='headline' size='sm'>
            Search on nostr
          </Text>
        </Stack>
        <br />
        <PaperContainer>
          <Stack sx={styles.header} justify='space-between'>
            <Search
              placeholder='Search on nostr'
              defaultValue={module.query}
              onChange={(e) => onChange(e.target.value)}
            />
          </Stack>
          <Expandable expanded>
            <SearchSettings module={module} />
          </Expandable>
          <Divider />
          <ContentProvider value={{ blured: feed.blured }}>
            <FeedList
              feed={feed}
              onScrollEnd={feed.paginate}
              render={(event) => <NostrEventFeedItem event={event} />}
              footer={<PostLoading rows={4} />}
            />
          </ContentProvider>
        </PaperContainer>
      </CenteredContainer>
    </NostrProvider>
  )
})

const styles = css.create({
  root: {
    marginTop: spacing.margin2,
  },
  header: {
    padding: spacing.padding1,
  },
})
