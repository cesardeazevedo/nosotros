import { DeckContainer } from '@/components/modules/Deck/DeckContainer'
import { DeckList } from '@/components/modules/Deck/DeckList'
import { DeckNew } from '@/components/modules/Deck/DeckNew'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export const DeckRoute = observer(function DeckRoute() {
  const { sidebarCollapsed } = useGlobalSettings()

  return (
    <DeckContainer sx={sidebarCollapsed && styles.expanded}>
      <DeckList />
      <DeckNew />
    </DeckContainer>
  )
})

const styles = css.create({
  expanded: {
    marginLeft: 84,
  },
})
