import { MediaColumn } from '@/components/modules/Media/MediaColumn'
import { NAddressColumn } from '@/components/modules/NAddress/NAddressColumn'
import { NEventColumn } from '@/components/modules/NEvent/NEventColumn'
import { NotificationsColumn } from '@/components/modules/Notifications/NotificationsColumn'
import { NProfileColumn } from '@/components/modules/NProfile/NProfileColumn'
import { RelayFeedColumn } from '@/components/modules/RelayFeed/RelayFeedColumn'
import { SearchColumn } from '@/components/modules/Search/SearchColumn'
import { TagsColumn } from '@/components/modules/Tag/TagColumn'
import { NostrProvider } from '@/components/providers/NostrProvider'
import { useRootStore } from '@/hooks/useRootStore'
import type { BaseModule } from '@/stores/modules/module'
import {
  isHomeModule,
  isMediaModule,
  isNAddressModule,
  isNEventModule,
  isNotificationModule,
  isNProfileModule,
  isRelayFeedModule,
  isSearchModule,
  isTagModule,
} from '@/stores/modules/module.store'
import { HomeColumn } from 'components/modules/Home/HomeColumn'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { DeckColumn } from './DeckColumn'
import { DeckContext, deckContextvalues } from './DeckContext'

const DeckModuleContext = function DeckModuleContext(props: {
  children: React.ReactNode
  module: BaseModule
  enabled?: boolean
}) {
  const { module, children, enabled } = props
  if (module.context && enabled !== false) {
    return <NostrProvider nostrContext={() => module.context!}>{children}</NostrProvider>
  }
  return children
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
              <DeckModuleContext module={module} enabled={!isRelayFeedModule(module)}>
                {isHomeModule(module) && <HomeColumn module={module} />}
                {isNProfileModule(module) && <NProfileColumn module={module} />}
                {isNEventModule(module) && <NEventColumn module={module} />}
                {isNAddressModule(module) && <NAddressColumn module={module} />}
                {isNotificationModule(module) && <NotificationsColumn module={module} />}
                {isMediaModule(module) && <MediaColumn module={module} />}
                {isRelayFeedModule(module) && <RelayFeedColumn module={module} />}
                {isTagModule(module) && <TagsColumn module={module} />}
                {isSearchModule(module) && <SearchColumn module={module} />}
              </DeckModuleContext>
            </DeckContext.Provider>
          </DeckColumn>
        )
      })}
    </>
  )
})
