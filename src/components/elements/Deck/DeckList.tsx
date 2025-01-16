import { NEventColumn } from '@/components/modules/NEvent/NEventColumn'
import { NotificationsColumn } from '@/components/modules/Notifications/NotificationsColumn'
import { NProfileColumn } from '@/components/modules/NProfile/NProfileColumn'
import { NostrProvider } from '@/components/providers/NostrProvider'
import { useRootStore } from '@/hooks/useRootStore'
import type { BaseModule } from '@/stores/modules/module'
import { isHomeModule, isNEventModule, isNotificationModule, isNProfileModule } from '@/stores/modules/module.store'
import { HomeColumn } from 'components/modules/Home/HomeColumn'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { DeckColumn } from './DeckColumn'
import { DeckContext } from './DeckContext'

const DeckModuleContext = function DeckModuleContext(props: { children: React.ReactNode; module: BaseModule }) {
  const { module, children } = props
  if (module.context) {
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
            <DeckContext.Provider value={{ index }}>
              <DeckModuleContext module={module}>
                {isHomeModule(module) && <HomeColumn module={module} />}
                {isNProfileModule(module) && <NProfileColumn module={module} />}
                {isNEventModule(module) && <NEventColumn module={module} />}
                {isNotificationModule(module) && <NotificationsColumn module={module} />}
              </DeckModuleContext>
            </DeckContext.Provider>
          </DeckColumn>
        )
      })}
    </>
  )
})
