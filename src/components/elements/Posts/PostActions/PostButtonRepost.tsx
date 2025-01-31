import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { repostStore } from '@/stores/reposts/reposts.store'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconShare3 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { RepostPopover } from '../../Repost/RepostPopover'
import { ButtonContainer } from './PostButtonContainer'
import { iconProps } from './utils'

export const ButtonRepost = observer(function ButtonRepost() {
  const { dense } = useContentContext()
  const { note } = useNoteContext()
  const pubkey = useCurrentPubkey()
  const myReposts = repostStore.getByPubkey(pubkey)
  const reposted = myReposts?.has(note.event.id)

  return (
    <ButtonContainer value={note.repostTotal}>
      <RepostPopover note={note}>
        {({ getProps, setRef, open }) => (
          <IconButton
            {...getProps()}
            ref={setRef}
            toggle={reposted}
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
