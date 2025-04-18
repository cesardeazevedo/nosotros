import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { useRootStore } from '@/hooks/useRootStore'
import { HomeModuleModel } from '@/stores/modules/home.module'
import { MediaModuleModel } from '@/stores/modules/media.module'
import { NostrModuleModule } from '@/stores/modules/nostr.module'
import { NProfileModuleModel } from '@/stores/modules/nprofile.module'
import { RelayDiscoveryModuleModel } from '@/stores/modules/relay.discovery.module'
import { observer } from 'mobx-react-lite'
import { HomeFeedTabs } from '../Home/HomeFeedTabs'
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

export const DeckList = observer(function DeckList() {
  const root = useRootStore()
  return (
    <>
      {root.decks.selected.list.map((module, index) => {
        const key = `${module.type}:${module.id}`
        return (
          <DeckColumn key={key}>
            <DeckContext.Provider value={{ ...deckContextvalues, module, index }}>
              {HomeModuleModel.is(module) && (
                <DeckColumnFeed id={module.id} leading={<HomeFeedTabs module={module} />} feed={module.feed} />
              )}
              {NProfileModuleModel.is(module) && <NProfileColumn module={module} />}
              {MediaModuleModel.is(module) && <MediaColumn module={module} />}
              {module.type === 'notifications' && <NotificationColumn module={module} />}
              {module.type === 'tags' && <TagColumn module={module} />}
              {module.type === 'articles' && (
                <DeckColumnFeed id={module.id} feed={module.feed} label='Articles' settings={false} />
              )}
              {module.type === 'search' && <SearchColumn module={module} />}
              {module.type === 'relayfeed' && (
                <DeckColumnFeed
                  id={module.id}
                  feed={module.feed}
                  leading={module.feed.context.relays?.[0] && <RelayChip url={module.feed.context.relays?.[0]} />}
                />
              )}
              {NostrModuleModule.is(module) && <NostrEventColumn module={module} />}
              {RelayDiscoveryModuleModel.is(module) && <RelayDiscoveryColumn module={module} />}
            </DeckContext.Provider>
          </DeckColumn>
        )
      })}
    </>
  )
})
