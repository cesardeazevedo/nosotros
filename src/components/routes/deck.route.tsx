import DeckContainer from 'components/elements/Deck/DeckContainer'
import DeckList from 'components/elements/Deck/DeckList'
import DeckColumn from 'components/elements/Deck/DeckNew'
import DeckSidebar from 'components/elements/Deck/DeckSidebar'
import { useEffect } from 'react'

function DeckRoute() {
  useEffect(() => {
    document.documentElement.classList.add('deck')
    return () => document.documentElement.classList.remove('deck')
  }, [])

  return (
    <DeckContainer>
      <DeckSidebar />
      <DeckList />
      <DeckColumn />
    </DeckContainer>
  )
}

export default DeckRoute
