import { buttonTokens } from '@/components/ui/Button/Button.stylex'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { IconX } from '@tabler/icons-react'
import { css } from 'react-strict-dom'

type Props = {
  onClick: () => void
}

export const DeleteButton = (props: Props) => {
  return (
    <IconButton
      size='sm'
      sx={styles.root}
      variant='filled'
      onClick={() => props.onClick()}
      icon={<IconX strokeWidth='2.0' size={18} />}
    />
  )
}

const styles = css.create({
  root: {
    [buttonTokens.containerColor]: 'black',
    [buttonTokens.labelTextColor]: 'white',
    position: 'absolute',
    right: 8,
    top: 12,
    color: 'white',
    zIndex: 1000,
  },
})
