import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconMessageCircle, IconMessageCircle2Filled } from '@tabler/icons-react'
import { ButtonContainer, type ContainerProps } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  dense?: boolean
  selected?: boolean
  onClick?: () => void
}

export const ButtonReply = (props: Props & ContainerProps) => {
  const { dense = false, selected = false, onClick, ...rest } = props
  return (
    <ButtonContainer {...rest}>
      <Tooltip cursor='arrow' text='Replies'>
        <IconButton
          toggle={selected}
          selected={selected}
          size={dense ? 'sm' : 'md'}
          onClick={onClick}
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
}
