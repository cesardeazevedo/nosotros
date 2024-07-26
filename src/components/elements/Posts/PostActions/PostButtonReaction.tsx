import { Box, IconButton } from '@mui/material'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import type Note from 'stores/models/note'
import { fallbackEmoji, reactionStore } from 'stores/nostr/reactions.store'
import ReactionPicker from '../../Reactions/ReactionPicker'
import ReactionsTooltip from '../../Reactions/ReactionsTooltip'
import ButtonContainer from './PostButtonContainer'

type Props = {
  note: Note
  dense?: boolean
}

// Only known emojis
const emojiColors: Record<string, string> = {
  '❤️': 'error.main',
  '🚀': '#fe6f00',
  '👍': '#ffb41f',
  '🤙': '#ffb41f',
  '😂': '#ffb41f',
  '🫡': '#ffb41f',
  '😮': '#ffb41f',
  '😭': '#ffb41f',
  '😡': '#e74303',
}

const PostButtonReaction = observer(function PostReactions(props: Props) {
  const { note, dense } = props
  const total = reactionStore.getTotal(note.id)
  const myReaction = fallbackEmoji(reactionStore.myReactions.get(note.id)?.[0]) || ''
  const color = emojiColors[myReaction] || ''
  return (
    <>
      <ButtonContainer
        animate={false}
        active={!!myReaction}
        color={myReaction ? emojiColors[myReaction] || 'primary' : undefined}
        dense={dense}
        value={
          <ReactionsTooltip noteId={note.id}>
            <span>{total || ''}</span>
          </ReactionsTooltip>
        }>
        <ReactionPicker onClick={(reaction) => note.react(reaction)}>
          <IconButton
            size={dense ? 'small' : 'medium'}
            onClick={() => note.react('❤️')}
            sx={{
              mr: myReaction ? 1 : 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}>
            <AnimatePresence>
              {myReaction && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, display: 'flex', position: 'absolute', height: dense ? 20 : 24 }}
                  style={{ color }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 8 }}>
                  {myReaction === '❤️' ? (
                    <IconHeartFilled color='inherit' />
                  ) : (
                    <Box component='span' sx={{ color: '#000', marginTop: dense ? 0 : '-4px' }}>
                      {myReaction}
                    </Box>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!myReaction && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, display: 'flex', position: 'absolute', height: 24 }}
                  exit={{ scale: 0 }}
                  whileTap={{ scale: 0.9 }}>
                  <IconHeart strokeWidth={1.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </IconButton>
        </ReactionPicker>
      </ButtonContainer>
    </>
  )
})

export default PostButtonReaction
