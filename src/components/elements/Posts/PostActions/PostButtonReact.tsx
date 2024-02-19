import { IconButton } from '@mui/material'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'
import type { Note } from 'stores/modules/note.store'
import { fallbackEmoji } from 'stores/nostr/reactions.store'
import ReactionPicker from '../../Reactions/ReactionPicker'
import ReactionsTooltip from '../../Reactions/ReactionsTooltip'
import ButtonContainer from './PostButtonContainer'

type Props = {
  note: Note
  dense?: boolean
}

const PostButtonReact = observer(function PostReactions(props: Props) {
  const { note, dense } = props
  const noteId = note.id
  const store = useStore()
  const total = store.reactions.getTotal(noteId)
  const myReactions = store.reactions.myReactions.get(noteId)?.at(0)
  const { defaultEmoji } = store.settings
  return (
    <>
      <ButtonContainer
        active
        dense={dense}
        value={
          <ReactionsTooltip noteId={noteId}>
            <span>{total || ''}</span>
          </ReactionsTooltip>
        }>
        <ReactionPicker
          onClick={(emoji) => {
            store.reactions.react(note, emoji)
          }}>
          <IconButton
            size='small'
            color='info'
            sx={{ backgroundColor: myReactions ? 'divider' : 'none' }}
            onClick={() => store.reactions.react(note, defaultEmoji)}>
            {myReactions ? fallbackEmoji(myReactions) : defaultEmoji}
          </IconButton>
        </ReactionPicker>
      </ButtonContainer>
    </>
  )
})

export default PostButtonReact
