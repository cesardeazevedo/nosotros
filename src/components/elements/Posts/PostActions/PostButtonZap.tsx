import { IconButton, IconButtonProps } from '@mui/material'
import { IconBolt } from '@tabler/icons-react'
import Tooltip from 'components/elements/Layouts/Tooltip'
import ButtonContainer, { ContainerProps } from './PostButtonContainer'

type Props = {
  size?: IconButtonProps['size']
  onClick?: () => void
}

function ButtonZap(props: Props & ContainerProps) {
  const { size = 'small', onClick, ...rest } = props
  return (
    <ButtonContainer {...rest} color='#7519eb'>
      <Tooltip arrow comingSoon title='Send a Zap'>
        <IconButton size={size} onClick={onClick}>
          <IconBolt strokeWidth='1.5' />
        </IconButton>
      </Tooltip>
    </ButtonContainer>
  )
}

export default ButtonZap
