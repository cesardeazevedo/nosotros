import { IconButton, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useStore } from 'stores'
import ReactionPicker from '../../Reactions/ReactionPicker'
import ReactionsTooltip from '../../Reactions/ReactionsTooltip'
import ButtonContainer from './PostButtonContainer'

type Props = {
  noteId: string
  dense?: boolean
}

const PostReactions = observer(function PostReactions(props: Props) {
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
          total > 0 && (
            <ReactionsTooltip noteId={noteId}>
              <Typography variant='subtitle1' color='textSecondary' sx={{ ml: 0, fontWeight: 500 }}>
                {total}
              </Typography>
            </ReactionsTooltip>
          )
        }>
        <ReactionPicker>
          <IconButton size='small' sx={{ width: dense ? 30 : 34, height: dense ? 30 : 34, color: 'inherit' }}>
            {defaultEmoji}
          </IconButton>
        </ReactionPicker>
      </ButtonContainer>
    </>
  )
})

export default PostReactions
