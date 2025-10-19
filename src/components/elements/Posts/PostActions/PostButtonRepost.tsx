import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { useReposts, useRepostsByPubkey } from '@/hooks/query/useReposts'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconShare3 } from '@tabler/icons-react'
import { memo } from 'react'
import { RepostPopover } from '../../Repost/RepostPopover'
import { ButtonContainer } from './PostButtonContainer'
import { iconProps } from './utils'

export const ButtonRepost = memo(function ButtonRepost() {
  const { event } = useNoteContext()
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()
  const reposts = useReposts(event)
  const reposted = useRepostsByPubkey(pubkey, event)

  return (
    <ButtonContainer value={reposts.data?.length}>
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
    </ButtonContainer>
  )
})
