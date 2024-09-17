import { IconButton } from '@/components/ui/IconButton/IconButton'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'
import type Note from 'stores/models/note'
import { fallbackEmoji, reactionStore } from 'stores/nostr/reactions.store'
import ReactionPicker from '../../Reactions/ReactionPicker'
import ReactionsTooltip from '../../Reactions/ReactionsTooltip'
import ButtonContainer from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  note: Note
  dense?: boolean
}

// Only known emojis
const emojiColors: Record<string, string> = {
  '❤️': colors.red7,
  '🚀': colors.orange9,
  '👍': colors.yellow7,
  '🤙': colors.yellow7,
  '😂': colors.yellow7,
  '🫡': colors.yellow7,
  '😮': colors.yellow7,
  '😭': colors.yellow7,
  '😡': colors.orange7,
}

const PostButtonReaction = observer(function PostReactions(props: Props) {
  const { note, dense } = props
  const total = reactionStore.getTotal(note.id)
  const myReaction = fallbackEmoji(reactionStore.myReactions.get(note.id)?.[0]) || ''
  const color = emojiColors[myReaction] || colors.red7
  return (
    <>
      <ButtonContainer
        active={!!myReaction}
        dense={dense}
        value={
          !!total && (
            <ReactionsTooltip noteId={note.id}>
              <span>{total || ''}</span>
            </ReactionsTooltip>
          )
        }>
        <ReactionPicker onClick={(reaction) => note.react(reaction)}>
          <span>
            <AnimatePresence initial={false}>
              <IconButton
                size={dense ? 'sm' : 'md'}
                selected={!!myReaction}
                variant='standard'
                onClick={() => note.react('❤️')}
                sx={[(color && styles[`button$${color}`]) || styles.button$red]}
                selectedIcon={
                  <motion.div
                    key='myreaction'
                    style={{ color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}>
                    {myReaction === '❤️' ? (
                      <IconHeartFilled
                        size={dense ? iconProps.size$dense : iconProps.size}
                        strokeWidth={iconProps.strokeWidth}
                      />
                    ) : (
                      <html.span>{myReaction}</html.span>
                    )}
                  </motion.div>
                }
                icon={
                  <motion.div
                    key={'reaction'}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                    whileTap={{ color: colors.red7, scale: 0.9 }}>
                    <IconHeart
                      size={dense ? iconProps.size$dense : iconProps.size}
                      strokeWidth={iconProps.strokeWidth}
                    />
                  </motion.div>
                }
              />
            </AnimatePresence>
          </span>
        </ReactionPicker>
      </ButtonContainer>
    </>
  )
})

const styles = css.create({
  [colors.red7]: { color: colors.red7 },
  [colors.yellow7]: { color: colors.yellow7 },
  [colors.orange7]: { color: colors.orange7 },
  [colors.orange9]: { color: colors.orange9 },
})

export default PostButtonReaction
