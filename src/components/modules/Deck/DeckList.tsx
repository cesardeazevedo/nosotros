import type { DeckColumn } from '@/atoms/deck.atoms'
import type { EventModule } from '@/hooks/modules/createEventModule'
import type { MediaFeedModule } from '@/hooks/modules/createMediaFeedModule'
import type { NotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import { memo } from 'react'
import { ArticlesColumn } from '../Articles/ArticlesColumn'
import { HomeColumn } from '../Home/HomeColumn'
import { ListColumn } from '../Lists/ListColumn'
import { ListsColumn } from '../Lists/ListsColumn'
import { MediaColumn } from '../Media/MediaColumn'
import { NostrEventColumn } from '../NostrEvent/NostrEventColumn'
import { NotificationColumn } from '../Notifications/NotificationColumn'
import { NProfileColumn } from '../NProfile/NProfileColumn'
import { RelayDiscoveryColumn } from '../RelayDiscovery/RelayDiscoveryColumn'
import { RelayFeedColumn } from '../RelayFeed/RelayFeedColumn'
import { SearchColumn } from '../Search/SearchColumn'
import { TagColumn } from '../Tag/TagColumn'
import { DeckColumnContainer } from './DeckColumnContainer'
import { DeckColumnContext } from './DeckContext'
import { useDeck } from './hooks/useDeck'

type Props = {
  column: DeckColumn
}

const DeckModule = (props: Props) => {
  const { column } = props
  switch (column.type) {
    case 'home': {
      return <HomeColumn feedModule={column} />
    }
    case 'profile': {
      return <NProfileColumn feedModule={column} />
    }
    case 'media': {
      return <MediaColumn module={column as MediaFeedModule} />
    }
    case 'inbox': {
      return <NotificationColumn module={column as NotificationFeedModule} />
    }
    case 'tags': {
      return <TagColumn module={column} />
    }
    case 'articles': {
      return <ArticlesColumn module={column} />
    }
    case 'search': {
      return <SearchColumn module={column} />
    }
    case 'event': {
      return <NostrEventColumn module={column as EventModule} />
    }
    case 'relaydiscovery': {
      return <RelayDiscoveryColumn module={column} />
    }
    case 'relayfeed': {
      return <RelayFeedColumn module={column} />
    }
    case 'lists': {
      return <ListsColumn module={column} />
    }
    // case 'relaysets': {
    //   return <DeckColumnFeed module={column} header={<FeedHeaderRelaySets feed={module.feed} />} />
    // }
    // case 'starterpack':
    case 'followset': {
      return <ListColumn module={column} />
    }
    default: {
      break
    }
  }
}

export const DeckList = memo(function DeckList() {
  const deck = useDeck()
  return (
    <>
      {deck?.columns.map((column, index) => {
        return (
          <DeckColumnContainer key={column.id}>
            <DeckColumnContext.Provider value={{ index, ...column }}>
              <DeckModule column={column} />
            </DeckColumnContext.Provider>
          </DeckColumnContainer>
        )
      })}
    </>
  )
})
