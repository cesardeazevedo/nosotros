import { DeckContainer } from '@/components/modules/Deck/DeckContainer'
import { DeckList } from '@/components/modules/Deck/DeckList'
import { DeckNew } from '@/components/modules/Deck/DeckNew'

export const DeckRoute = function DeckRoute() {
  return (
    <DeckContainer>
      <DeckList />
      <DeckNew />
    </DeckContainer>
  )
}
