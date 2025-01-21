import { useRootStore } from '@/hooks/useRootStore'
import { useRouter } from '@tanstack/react-router'
import { DeckContainer } from 'components/elements/Deck/DeckContainer'
import { DeckList } from 'components/elements/Deck/DeckList'
import { DeckNew } from 'components/elements/Deck/DeckNew'
import { DeckSidebar } from 'components/elements/Deck/DeckSidebar'
import { reaction } from 'mobx'
import { useEffect } from 'react'

export const DeckRoute = function DeckRoute() {
  const { auth, decks } = useRootStore()
  const router = useRouter()
  useEffect(() => {
    const disposer = reaction(
      () => [auth.pubkey, decks.selected.list],
      () => router.invalidate(),
    )
    return () => disposer()
  }, [])
  return (
    <DeckContainer>
      <DeckSidebar />
      <DeckList />
      <DeckNew />
    </DeckContainer>
  )
}
