import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconShare3 } from '@tabler/icons-react'
import { ButtonContainer, type ContainerProps } from './PostButtonContainer'
import { iconProps } from './utils'

type Props = {
  dense?: boolean
  onClick?: (e?: unknown) => void
}

export const ButtonRepost = (props: Props & ContainerProps) => {
  const { dense = false, onClick, ...rest } = props
  return (
    <ButtonContainer {...rest}>
      <Tooltip cursor='arrow' text='Repost'>
        <IconButton
          size={dense ? 'sm' : 'md'}
          onClick={onClick}
          icon={<IconShare3 size={dense ? iconProps.size$dense : iconProps.size} strokeWidth={iconProps.strokeWidth} />}
        />
      </Tooltip>
    </ButtonContainer>
  )
}
