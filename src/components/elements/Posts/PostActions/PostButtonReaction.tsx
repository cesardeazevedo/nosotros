import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { useMobile } from '@/hooks/useMobile'
import { useCurrentPubkey, useRootContext } from '@/hooks/useRootStore'
import { publishReaction } from '@/nostr/publish/publishReaction'
import { fallbackEmoji, reactionStore } from '@/stores/reactions/reactions.store'
import { toastStore } from '@/stores/ui/toast.store'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { ReactionPicker } from '../../Reactions/ReactionPicker'
import { ReactionsTooltip } from '../../Reactions/ReactionsTooltip'
import { ButtonContainer } from './PostButtonContainer'
import { iconProps } from './utils'

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

export const ButtonReaction = observer(function ButtonReaction() {
  const { note } = useNoteContext()
  const { dense } = useContentContext()
  const [mobileOpen, setMobileOpen] = useState(false)
  const total = reactionStore.getTotal(note.id)
  const pubkey = useCurrentPubkey()
  const myReactions = reactionStore.getByPubkey(pubkey)
  const myReaction = fallbackEmoji(myReactions?.[note.id]?.[0])
  const color = myReaction ? emojiColors[myReaction] || colors.red7 : colors.red7
  const { context } = useRootContext()
  const mobile = useMobile()

  const handleReact = useCallback(
    (reaction: string) => {
      publishReaction(context, note.event.event, reaction).subscribe({
        error: (error) => toastStore.enqueue(error.message),
      })
    },
    [context, note],
  )

  return (
    <>
      <ButtonContainer
        value={
          !!total && (
            <ReactionsTooltip noteId={note.id}>
              <span>{total || ''}</span>
            </ReactionsTooltip>
          )
        }>
        <ReactionPicker mobileOpen={mobileOpen} onClick={handleReact} onClose={() => setMobileOpen(false)}>
          <AnimatePresence initial={false}>
            <IconButton
              size={dense ? 'sm' : 'md'}
              selected={!!myReaction}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                if (mobile && !mobileOpen) {
                  setMobileOpen(true)
                } else {
                  handleReact('❤️')
                  setMobileOpen(false)
                }
              }}
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
                    <html.span style={styles.myCustomReaction}>{myReaction}</html.span>
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
                  <IconHeart size={dense ? iconProps.size$dense : iconProps.size} strokeWidth={iconProps.strokeWidth} />
                </motion.div>
              }
            />
          </AnimatePresence>
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
  myCustomReaction: {
    fontSize: '130%',
  },
})
