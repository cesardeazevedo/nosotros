import { IconButton, IconButtonProps } from '@mui/material'
import { IconExchange } from '@tabler/icons-react'
import Tooltip from 'components/elements/Layouts/Tooltip'
import ButtonContainer, { ContainerProps } from './PostButtonContainer'

type Props = {
  size?: IconButtonProps['size']
  onClick?: (e?: unknown) => void
}

function ButtonRepost(props: Props & ContainerProps) {
  const { size = 'small', onClick, ...rest } = props
  return (
    <ButtonContainer {...rest} color='#1E90FF'>
      <Tooltip arrow comingSoon title='Repost'>
        <IconButton size={size} onClick={onClick}>
          <IconExchange strokeWidth='1.5' />
        </IconButton>
      </Tooltip>
    </ButtonContainer>
  )
}

export default ButtonRepost
