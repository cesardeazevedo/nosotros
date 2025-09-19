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
      variant='standard'
      onClick={() => props.onClick()}
      icon={<IconX strokeWidth='2.5' size={16} />}
    />
  )
}

const styles = css.create({
  root: {
    position: 'absolute',
    right: 10,
    top: 14,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
  },
})
