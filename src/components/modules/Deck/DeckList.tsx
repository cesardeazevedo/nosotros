import { useRootStore } from '@/hooks/useRootStore'
import type { HomeModule } from '@/stores/modules/home.module'
import type { MediaModule } from '@/stores/modules/media.module'
import type { ModulesInstances } from '@/stores/modules/module.store'
import { observer } from 'mobx-react-lite'
import { ArticlesHeader } from '../Articles/ArticlesHeader'
import { FeedHeader } from '../Feed/FeedHeader'
import { FeedHeaderFollowSet } from '../Feed/headers/FeedHeaderFollowSet'
import { FeedHeaderRelaySets } from '../Feed/headers/FeedHeaderRelaySets'
import { HomeColumn } from '../Home/HomeColumn'
import { MediaColumn } from '../Media/MediaColumn'
import { NostrEventColumn } from '../NostrEvent/NostrEventColumn'
import { NotificationColumn } from '../Notifications/NotificationColumn'
import { NProfileColumn } from '../NProfile/NProfileColumn'
import { RelayDiscoveryColumn } from '../RelayDiscovery/RelayDiscoveryColumn'
import { SearchColumn } from '../Search/SearchColumn'
import { TagColumn } from '../Tag/TagColumn'
import { DeckColumn } from './DeckColumn'
import { DeckColumnFeed } from './DeckColumnFeed'
import { DeckContext, deckContextvalues } from './DeckContext'

type Props = {
  module: ModulesInstances
}

const DeckModule = (props: Props) => {
  const { module } = props
  switch (module.type) {
    case 'home': {
      return <HomeColumn module={module as HomeModule} />
    }
    case 'nprofile': {
      return <NProfileColumn module={module} />
    }
    case 'media': {
      return <MediaColumn module={module as MediaModule} />
    }
    case 'notifications': {
      return <NotificationColumn module={module} />
    }
    case 'tags': {
      return <TagColumn module={module} />
    }
    case 'articles': {
      return <DeckColumnFeed feed={module.feed} header={<ArticlesHeader />} />
    }
    case 'search': {
      return <SearchColumn module={module} />
    }
    case 'event': {
      return <NostrEventColumn module={module} />
    }
    case 'relaydiscovery': {
      return <RelayDiscoveryColumn module={module} />
    }
    case 'relayfeed': {
      return <DeckColumnFeed feed={module.feed} header={<FeedHeader module={module} />} />
    }
    case 'relaysets': {
      return <DeckColumnFeed feed={module.feed} header={<FeedHeaderRelaySets feed={module.feed} />} />
    }
    case 'starterpack':
    case 'followset': {
      return <DeckColumnFeed feed={module.feed} header={<FeedHeaderFollowSet feed={module.feed} />} />
    }
    default: {
      break
    }
  }
}

export const DeckList = observer(function DeckList() {
  const root = useRootStore()
  return (
    <>
      {root.decks.selected.list.map((module, index) => {
        const key = `${module.type}:${module.id}`
        return (
          <DeckColumn key={key}>
            <DeckContext.Provider value={{ ...deckContextvalues, module, index }}>
              <DeckModule module={module} />
            </DeckContext.Provider>
          </DeckColumn>
        )
      })}
    </>
  )
})
