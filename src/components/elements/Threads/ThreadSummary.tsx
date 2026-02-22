import { IconThread } from '@/components/elements/Icons/IconThread'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useEventReplies, useRepliesPubkeys } from '@/hooks/query/useReplies'
import type { NoteState } from '@/hooks/state/useNote'
import { palette } from '@/themes/palette.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import type { SxProps } from '@/components/ui/types'
import { UsersAvatars } from '../User/UsersAvatars'

type Props = {
  note: NoteState
  mode?: 'parents' | 'replies'
  count?: number
  sx?: SxProps
  pubkeysOverride?: string[]
  renderThreadIcon?: boolean
  onClick?: () => void
}

export const ThreadSummary = memo(function ThreadSummary(props: Props) {
  const { note, sx, mode = 'replies', count, pubkeysOverride, renderThreadIcon = false, onClick } = props
  const repliesPubkeys = useRepliesPubkeys(note.event)
  const pubkeys = [...new Set((pubkeysOverride ?? repliesPubkeys).filter(Boolean))]
  const { total } = useEventReplies(note.event)
  const resolvedCount = count ?? total
  if (mode === 'replies' && resolvedCount === 0) {
    return null
  }

  return (
    <Stack sx={[styles.root, renderThreadIcon && styles.root$thread, sx]} gap={1}>
      {renderThreadIcon && <IconThread />}
      <UsersAvatars sx={styles.avatars} renderTooltip={false} pubkeys={pubkeys.slice(0, 3)} />
      <Button
        variant='text'
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (onClick) {
            onClick()
          }
        }}>
        {mode === 'parents' && `See full thread${count ? ` (${count})` : ''}`}
        {mode === 'replies' && `See Replies${resolvedCount ? ` (${resolvedCount})` : ''}`}
      </Button>
    </Stack>
  )
})

const styles = css.create({
  root: {
    paddingLeft: 4,
    color: palette.outlineVariant,
  },
  root$thread: {},
  avatars: {
    width: 55,
  },
})
