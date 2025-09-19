import { useContentContext } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { useRepostsByPubkey } from '@/hooks/query/useReposts'
import type { NoteState } from '@/hooks/state/useNote'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconShare3 } from '@tabler/icons-react'
import { memo } from 'react'
import { RepostPopover } from '../../Repost/RepostPopover'
import { ButtonContainer } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  note: NoteState
}

export const ButtonRepost = memo(function ButtonRepost(props: Props) {
  const { note } = props
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()
  const reposted = useRepostsByPubkey(pubkey, note.event)

  return (
    <ButtonContainer value={note.reposts.data?.length}>
      <RepostPopover note={note}>
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
