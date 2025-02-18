import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { Button } from '@/components/ui/Button/Button'
import { Search } from '@/components/ui/Search/Search'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SearchModule } from '@/stores/modules/search.module'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { getSnapshot } from 'mobx-state-tree'
import { useObservable, useSubscription } from 'observable-hooks'
import { useContext } from 'react'
import { css } from 'react-strict-dom'
import { mergeMap } from 'rxjs'
import { useSearchChange } from './hooks/useSearchChange'
import { SearchSettings } from './SearchSettings'

type Props = {
  module: SearchModule
}

export const SearchColumn = observer(function SearchColumn(props: Props) {
  const { module } = props
  const { feed } = module
  const { delay } = useContext(DeckContext)
  const onChange = useSearchChange(module)

  const sub = useObservable(
    (module$) => module$.pipe(mergeMap(([module]) => module.subscribe())),
    [module, getSnapshot(module.contextWithFallback)],
  )
  useSubscription(sub)
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
        settings={<SearchSettings module={module} />}>
        <Search
          sx={styles.search}
          placeholder='Search on nostr'
          defaultValue={module.query}
          onChange={(e) => onChange(e.target.value)}
        />
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

const styles = css.create({
  search: {
    width: '100%',
    height: 40,
  },
})
