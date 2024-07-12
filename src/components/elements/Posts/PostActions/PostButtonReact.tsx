import { IconButton } from '@mui/material'
import { IconHeart } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import type Note from 'stores/models/note'
import { fallbackEmoji, reactionStore } from 'stores/nostr/reactions.store'
import { settingsStore } from 'stores/ui/settings.store'
import ReactionPicker from '../../Reactions/ReactionPicker'
import ReactionsTooltip from '../../Reactions/ReactionsTooltip'
import ButtonContainer from './PostButtonContainer'

type Props = {
  note: Note
  dense?: boolean
}

const PostButtonReact = observer(function PostReactions(props: Props) {
  const { note, dense } = props
  const total = reactionStore.getTotal(note.id)
  const myReactions = reactionStore.myReactions.get(note.id)?.[0][0]
  const { defaultEmoji } = settingsStore
  return (
    <>
      <ButtonContainer
        active
        dense={dense}
        value={
          <ReactionsTooltip noteId={note.id}>
            <span>{total || ''}</span>
          </ReactionsTooltip>
        }>
        <ReactionPicker onClick={() => { }}>
          <IconButton size='small' color='info' sx={{ backgroundColor: myReactions ? 'divider' : 'none' }}>
            {myReactions ? fallbackEmoji(myReactions) : <>{defaultEmoji || <IconHeart strokeWidth='1.5' />}</>}
          </IconButton>
        </ReactionPicker>
      </ButtonContainer>
    </>
  )
})

export default PostButtonReact
