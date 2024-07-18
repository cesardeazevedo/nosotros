import FeedColumn from 'components/modules/Feed/FeedColumn'
import HomeColumn from 'components/modules/Home/HomeColumn'
import PostColumn from 'components/modules/Post/PostColumn'
import UserColumn from 'components/modules/User/UserColumn'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { FeedModule } from 'stores/modules/feed.module'
import { GuestModule } from 'stores/modules/guest.module'
import { HomeModule } from 'stores/modules/home.module'
import { NoteModule } from 'stores/modules/note.module'
import { ProfileModule } from 'stores/modules/profile.module'
import { deckStore } from 'stores/ui/deck.store'

const DeckList = observer(function DeckList() {
  return (
    <>
      {deckStore.deck.map((module) => {
        return (
          <React.Fragment key={module.id}>
            {module instanceof HomeModule && <HomeColumn module={module} />}
            {module instanceof GuestModule && <HomeColumn module={module} />}
            {module instanceof ProfileModule && <UserColumn module={module} />}
            {module instanceof NoteModule && <PostColumn module={module} />}
            {module instanceof FeedModule && <FeedColumn feed={module} />}
          </React.Fragment>
        )
      })}
    </>
  )
})

export default DeckList
