import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconMessageCircle } from '@tabler/icons-react'
import ButtonContainer, { type ContainerProps } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  dense?: boolean
  onClick?: () => void
}

function ButtonReply(props: Props & ContainerProps) {
  const { dense = false, onClick, ...rest } = props
  return (
    <ButtonContainer {...rest}>
      <Tooltip cursor='arrow' text='Replies'>
        <IconButton
          size={dense ? 'sm' : 'md'}
          onClick={onClick}
          icon={
            <IconMessageCircle
              size={dense ? iconProps.size$dense : iconProps.size}
              strokeWidth={iconProps.strokeWidth}
            />
          }
        />
      </Tooltip>
    </ButtonContainer>
  )
}

export default ButtonReply
