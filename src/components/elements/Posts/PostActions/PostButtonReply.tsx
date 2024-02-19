import { IconButton, type IconButtonProps } from '@mui/material'
import { IconMessageCircle } from '@tabler/icons-react'
import Tooltip from 'components/elements/Layouts/Tooltip'
import ButtonContainer, { type ContainerProps } from './PostButtonContainer'

type Props = {
  size?: IconButtonProps['size']
  onClick?: () => void
}

function ButtonReply(props: Props & ContainerProps) {
  const { size = 'small', onClick, ...rest } = props
  return (
    <ButtonContainer {...rest}>
      <Tooltip arrow title='Comment'>
        <IconButton size={size} onClick={onClick}>
          <IconMessageCircle strokeWidth='1.5' />
        </IconButton>
      </Tooltip>
    </ButtonContainer>
  )
}

export default ButtonReply
