import { DeckContainer } from '@/components/modules/Deck/DeckContainer'
import { DeckList } from '@/components/modules/Deck/DeckList'
import { DeckNew } from '@/components/modules/Deck/DeckNew'
import { useResetScroll } from '@/hooks/useResetScroll'

export const DeckRoute = function DeckRoute() {
  useResetScroll()
  return (
    <DeckContainer>
      <DeckList />
      <DeckNew />
    </DeckContainer>
  )
}
