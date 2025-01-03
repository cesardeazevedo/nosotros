import { DeckContainer } from 'components/elements/Deck/DeckContainer'
import { DeckList } from 'components/elements/Deck/DeckList'
import { DeckNew } from 'components/elements/Deck/DeckNew'
import { DeckSidebar } from 'components/elements/Deck/DeckSidebar'

export const DeckRoute = () => {
  return (
    <DeckContainer>
      <DeckSidebar />
      <DeckList />
      <DeckNew />
    </DeckContainer>
  )
}
