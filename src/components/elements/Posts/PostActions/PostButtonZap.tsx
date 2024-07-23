import { IconButton, useTheme, type IconButtonProps } from '@mui/material'
import { IconBolt } from '@tabler/icons-react'
import Tooltip from 'components/elements/Layouts/Tooltip'
import { observer } from 'mobx-react-lite'
import type Note from 'stores/models/note'
import { zapStore } from 'stores/nostr/zaps.store'
import ButtonContainer, { type ContainerProps } from './PostButtonContainer'

type Props = {
  note: Note
  size?: IconButtonProps['size']
  onClick?: () => void
}

const colors = {
  dark: ['#d3d3d3', '#c8a3f7', '#ba8cf5', '#ac75f3', '#9e5ef1', '#7519eb'],
  light: ['text.secondary', '#7d58ac', '#7c4eb6', '#7a43c1', '#7939cb', '#782ed6', '#7519eb'],
} as const

function getZapColor(zapAmount: number, palette: (typeof colors)['light'] | (typeof colors)['dark']): string {
  if (zapAmount < 1000) {
    return palette[0]
  } else if (zapAmount >= 1000 && zapAmount < 5000) {
    return palette[1]
  } else if (zapAmount >= 5000 && zapAmount < 10000) {
    return palette[2]
  } else if (zapAmount >= 10000 && zapAmount < 50000) {
    return palette[3]
  } else if (zapAmount >= 50000 && zapAmount < 100000) {
    return palette[4]
  } else {
    return palette[5]
  }
}

const formatter = new Intl.NumberFormat()

const ButtonZap = observer(function ButtonZap(props: Props & ContainerProps) {
  const { size = 'small', onClick, note, ...rest } = props
  const theme = useTheme()
  const total = zapStore.getTotal(note.id) || ''
  const palette = colors[theme.palette.mode]
  return (
    <ButtonContainer
      {...rest}
      active={false}
      color={getZapColor(total || 0, palette)}
      value={<>{total ? formatter.format(total) : ''}</>}>
      <Tooltip arrow title='Send a Zap (coming soon)'>
        <IconButton size={size} onClick={onClick}>
          <IconBolt strokeWidth='1.5' />
        </IconButton>
      </Tooltip>
    </ButtonContainer>
  )
})

export default ButtonZap
