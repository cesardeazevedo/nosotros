import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { useReposts, useRepostsByPubkey } from '@/hooks/query/useReposts'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconShare3 } from '@tabler/icons-react'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { RepostPopover } from '../../Repost/RepostPopover'
import { iconProps } from './utils'

export const ButtonRepost = memo(function ButtonRepost() {
  const { event } = useNoteContext()
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()
  const reposts = useReposts(event)
  const reposted = useRepostsByPubkey(pubkey, event)

  const count = reposts.data?.length || 0
  const button = (
    <RepostPopover>
      {({ getProps, setRef, open }) => (
        <IconButton
          {...getProps()}
          ref={setRef}
          toggle={!!reposted}
          size={dense ? 'sm' : 'md'}
          onClick={(e) => {
            open()
            e.stopPropagation()
            e.preventDefault()
          }}
          icon={
            <IconShare3
              fill={reposted ? colors.yellow5 : 'none'}
              color={reposted ? colors.yellow5 : 'currentColor'}
              size={dense ? iconProps.size$dense : iconProps.size}
              strokeWidth={iconProps.strokeWidth}
            />
          }
        />
      )}
    </RepostPopover>
  )

  if (!count) return button

  return (
    <Stack sx={styles.root} gap={0.5}>
      {button}
      {count}
    </Stack>
  )
})

const styles = css.create({
  root: {
    display: 'inline-flex',
    fontSize: typeScale.bodySize$lg,
    marginRight: spacing.margin1,
    fontWeight: 500,
  },
})
