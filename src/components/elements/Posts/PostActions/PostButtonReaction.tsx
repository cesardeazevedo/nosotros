import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { useReactionByPubkey } from '@/hooks/query/useReactions'
import type { NoteState } from '@/hooks/state/useNote'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useMobile } from '@/hooks/useMobile'
import { publishReaction } from '@/nostr/publish/publishReaction'
import { fallbackEmoji } from '@/utils/utils'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSetAtom } from 'jotai'
import type { NostrEvent } from 'nostr-tools'
import { memo, useState } from 'react'
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

type Props = {
  note: NoteState
}

export const ButtonReaction = memo(function ButtonReaction(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { note } = props
  const { dense } = useContentContext()
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const pubkey = useCurrentPubkey()
  const total = note.reactions.data?.length || 0
  const myReaction = useReactionByPubkey(pubkey, note.event)?.content
  const color = myReaction ? emojiColors[fallbackEmoji(myReaction)] || colors.red7 : colors.red7
  const mobile = useMobile()

  const { mutate } = usePublishEventMutation<[string, NostrEvent]>({
    mutationFn:
      ({ signer, pubkey }) =>
      ([reaction, event]) =>
        publishReaction(pubkey, event, reaction, { signer }),
    onError: (error) => {
      enqueueToast({ component: error.message })
    },
  })

  const handleReaction = (reaction: string) => {
    mutate([reaction, note.event])
  }

  return (
    <>
      <ButtonContainer
        value={
          !!total && (
            <ReactionsTooltip>
              <span>{total || ''}</span>
            </ReactionsTooltip>
          )
        }>
        <ReactionPicker mobileOpen={mobileOpen} onClick={handleReaction} onClose={() => setMobileOpen(false)}>
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
                  handleReaction('❤️')
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
                    <html.span style={styles.myCustomReaction}>{myReaction && fallbackEmoji(myReaction)}</html.span>
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
