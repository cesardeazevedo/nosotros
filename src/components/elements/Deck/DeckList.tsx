import HomeColumn from 'components/modules/Home/HomeColumn'
import PostColumn from 'components/modules/Post/PostColumn'
import UserColumn from 'components/modules/User/UserColumn'
import { observer } from 'mobx-react-lite'
import { GuestModule } from 'stores/modules/guest.module'
import { HomeModule } from 'stores/modules/home.module'
import { NoteModule } from 'stores/modules/note.module'
import { ProfileModule } from 'stores/modules/profile.module'
import { deckStore } from 'stores/ui/deck.store'
import { DeckColumn } from './DeckColumn'
import { DeckContext } from './DeckContext'

const DeckList = observer(function DeckList() {
  return (
    <>
      {deckStore.deck.map((module, index) => {
        return (
          <DeckColumn key={module.id}>
            <DeckContext.Provider value={{ index }}>
              {module instanceof HomeModule && <HomeColumn module={module} />}
              {module instanceof GuestModule && <HomeColumn module={module} />}
              {module instanceof ProfileModule && <UserColumn module={module} />}
              {module instanceof NoteModule && <PostColumn module={module} />}
            </DeckContext.Provider>
          </DeckColumn>
        )
      })}
    </>
  )
})

export default DeckList
