import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import type { Note } from '@/stores/notes/note'
import { repostStore } from '@/stores/reposts/reposts.store'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconShare3 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { RepostPopover } from '../../Repost/RepostPopover'
import { ButtonContainer } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  note: Note
  dense?: boolean
  onClick?: (e?: unknown) => void
}

export const ButtonRepost = observer(function ButtonRepost(props: Props) {
  const { dense = false, note } = props
  const pubkey = useCurrentPubkey()
  const myReposts = repostStore.getByPubkey(pubkey)
  const reposted = myReposts?.has(note.event.id)

  return (
    <ButtonContainer value={note.repostTotal}>
      <RepostPopover note={note}>
        {({ getProps, setRef, handleOpen }) => (
          <Tooltip cursor='arrow' text='Repost' closeEvents={{ focusOut: true }}>
            <IconButton
              {...getProps()}
              ref={setRef}
              toggle={reposted}
              size={dense ? 'sm' : 'md'}
              onClick={handleOpen}
              icon={
                <IconShare3
                  fill={reposted ? colors.yellow5 : 'none'}
                  color={reposted ? colors.yellow5 : 'currentColor'}
                  size={dense ? iconProps.size$dense : iconProps.size}
                  strokeWidth={iconProps.strokeWidth}
                />
              }
            />
          </Tooltip>
        )}
      </RepostPopover>
    </ButtonContainer>
  )
})
