import { IconButton } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useStore } from 'stores'
import ReactionPicker from '../../Reactions/ReactionPicker'
import ReactionsTooltip from '../../Reactions/ReactionsTooltip'
import ButtonContainer from './PostButtonContainer'

type Props = {
  noteId: string
  dense?: boolean
}

const PostButtonReact = observer(function PostReactions(props: Props) {
  const { noteId, dense } = props
  const store = useStore()
  const total = store.reactions.getTotal(noteId)
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
        <ReactionPicker>
          <IconButton size='small' color='inherit'>
            {defaultEmoji}
          </IconButton>
        </ReactionPicker>
      </ButtonContainer>
    </>
  )
})

export default PostButtonReact
