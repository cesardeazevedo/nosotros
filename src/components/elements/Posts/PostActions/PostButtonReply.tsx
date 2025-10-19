import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useEventReplies } from '@/hooks/query/useReplies'
import { IconMessageCircle, IconMessageCircle2Filled } from '@tabler/icons-react'
import { memo } from 'react'
import { ButtonContainer, type ContainerProps } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  selected?: boolean
  onClick?: () => void
}

export const ButtonReply = memo(function ButtonReply(props: Props & ContainerProps) {
  const { selected = false, onClick, ...rest } = props
  const { dense } = useContentContext()
  const { event } = useNoteContext()
  const { total } = useEventReplies(event)
  return (
    <ButtonContainer {...rest} value={total}>
      <Tooltip cursor='arrow' text='Replies'>
        <IconButton
          toggle={selected}
          selected={selected}
          size={dense ? 'sm' : 'md'}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClick?.()
          }}
          icon={
            <IconMessageCircle
              size={dense ? iconProps.size$dense : iconProps.size}
              strokeWidth={iconProps.strokeWidth}
            />
          }
          selectedIcon={
            <IconMessageCircle2Filled
              size={dense ? iconProps.size$dense : iconProps.size}
              strokeWidth={iconProps.strokeWidth}
            />
          }
        />
      </Tooltip>
    </ButtonContainer>
  )
})
