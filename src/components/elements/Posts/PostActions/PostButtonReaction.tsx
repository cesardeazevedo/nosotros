import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { useNostrContext } from '@/components/providers/NostrContextProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { useReactionByPubkey, useReactions } from '@/hooks/query/useReactions'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useMobile } from '@/hooks/useMobile'
import { publishReaction } from '@/nostr/publish/publishReaction'
import { duration } from '@/themes/duration.stylex'
import { fallbackEmoji } from '@/utils/utils'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
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

export const ButtonReaction = memo(function ButtonReaction() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bounceTick, setBounceTick] = useState(0)
  const { event } = useNoteContext()
  const { dense } = useContentContext()
  const ctx = useNostrContext()
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const pubkey = useCurrentPubkey()
  const reactions = useReactions(event)
  const total = reactions.data?.length || 0
  const myReaction = useReactionByPubkey(pubkey, event)?.content
  const color = myReaction ? emojiColors[fallbackEmoji(myReaction)] || colors.red7 : colors.red7
  const selectedColorStyle = (color && styles[`button$${color}`]) || styles.button$red
  const mobile = useMobile()

  const { mutate } = usePublishEventMutation<[string, NostrEvent]>({
    mutationFn:
      ({ signer, pubkey }) =>
        ([reaction, event]) =>
          publishReaction(pubkey, event, reaction, { signer, includeRelays: ctx?.relays }),
    onError: (error) => {
      enqueueToast({ component: error.message })
    },
  })

  const handleReaction = (reaction: string) => {
    mutate([reaction, event])
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
          <IconButton
            size={dense ? 'sm' : 'md'}
            selected={!!myReaction}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setBounceTick((tick) => tick + 1)
              if (mobile && !mobileOpen) {
                setMobileOpen(true)
              } else {
                handleReaction('❤️')
                setMobileOpen(false)
              }
            }}
            sx={selectedColorStyle}
            selectedIcon={
              <html.div key={`myreaction-${bounceTick}`} style={[styles.icon, styles.iconBounce]}>
                {myReaction === '❤️' ? (
                  <IconHeartFilled
                    size={dense ? iconProps.size$dense : iconProps.size}
                    strokeWidth={iconProps.strokeWidth}
                  />
                ) : (
                  <html.span style={styles.myCustomReaction}>{myReaction && fallbackEmoji(myReaction)}</html.span>
                )}
              </html.div>
            }
            icon={
              <html.div key={`reaction-${bounceTick}`} style={[styles.icon, styles.iconBounce]}>
                <IconHeart size={dense ? iconProps.size$dense : iconProps.size} strokeWidth={iconProps.strokeWidth} />
              </html.div>
            }
          />
        </ReactionPicker>
      </ButtonContainer>
    </>
  )
})

const reactionBounce = css.keyframes({
  '0%': { transform: 'scale(0.78)' },
  '65%': { transform: 'scale(1.12)' },
  '100%': { transform: 'scale(1)' },
})

const styles = css.create({
  [colors.red7]: { color: colors.red7 },
  [colors.yellow7]: { color: colors.yellow7 },
  [colors.orange7]: { color: colors.orange7 },
  [colors.orange9]: { color: colors.orange9 },
  icon: {
    display: 'flex',
  },
  iconBounce: {
    animationName: reactionBounce,
    animationDuration: duration.medium1,
    animationTimingFunction: 'ease-out',
  },
  myCustomReaction: {
    fontSize: '130%',
  },
})
