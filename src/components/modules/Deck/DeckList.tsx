import type { DeckColumn } from '@/atoms/deck.atoms'
import { persistentFeedStatesAtom } from '@/atoms/modules.atoms'
import type { EventModule } from '@/hooks/modules/createEventModule'
import type { MediaFeedModule } from '@/hooks/modules/createMediaFeedModule'
import type { NotificationFeedModule } from '@/hooks/modules/createNotificationFeedModule'
import type { ProfileModule } from '@/hooks/modules/createProfileFeedModule'
import type { Modules } from '@/hooks/modules/module'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { ArticlesColumn } from '../Articles/ArticlesColumn'
import { HomeColumn } from '../Home/HomeColumn'
import { ListColumn } from '../Lists/ListColumn'
import { MediaColumn } from '../Media/MediaColumn'
import { NostrEventColumn } from '../NostrEvent/NostrEventColumn'
import { NotificationColumn } from '../Notifications/NotificationColumn'
import { NProfileColumn } from '../NProfile/NProfileColumn'
import { RelayFeedColumn } from '../RelayFeed/RelayFeedColumn'
import { RelayMonitorColumn } from '../RelayMonitor/RelayMonitorColumn'
import { SearchColumn } from '../Search/SearchColumn'
import { TagColumn } from '../Tag/TagColumn'
import { DeckColumnContainer } from './DeckColumnContainer'
import { DeckColumnContext } from './DeckContext'
import { useDeck } from './hooks/useDeck'

type Props = {
  module: Modules
}

const DeckModule = (props: Props) => {
  const { module } = props
  switch (module.type) {
    case 'home': {
      return <HomeColumn module={module} />
    }
    case 'profile': {
      return <NProfileColumn module={module as ProfileModule} />
    }
    case 'media': {
      return <MediaColumn module={module as MediaFeedModule} />
    }
    case 'inbox': {
      return <NotificationColumn module={module as NotificationFeedModule} />
    }
    case 'tags': {
      return <TagColumn module={module} />
    }
    case 'articles': {
      return <ArticlesColumn module={module} />
    }
    case 'search': {
      return <SearchColumn module={module} />
    }
    case 'event': {
      return <NostrEventColumn module={module as EventModule} />
    }
    case 'relaydiscovery': {
      return <RelayMonitorColumn module={module} />
    }
    case 'relayfeed': {
      return <RelayFeedColumn module={module} />
    }
    case 'lists':
    case 'relaysets':
    case 'starterpack':
    case 'followset': {
      return <ListColumn module={module} />
    }
    default: {
      break
    }
  }
}

const DeckColumn = (props: { index: number; id: string }) => {
  const { index, id } = props
  const module = useAtomValue(persistentFeedStatesAtom)[id]
  return (
    <DeckColumnContainer key={id}>
      <DeckColumnContext.Provider value={{ index, ...module }}>
        <DeckModule module={module} />
      </DeckColumnContext.Provider>
    </DeckColumnContainer>
  )
}

export const DeckList = memo(function DeckList() {
  const deck = useDeck()
  return (
    <>
      {deck?.columnIds?.map((id, index) => {
        return <DeckColumn key={id} index={index} id={id} />
      })}
    </>
  )
})
