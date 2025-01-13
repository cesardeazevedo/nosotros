import { buttonTokens } from '@/components/ui/Button/Button.stylex'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { palette } from '@/themes/palette.stylex'
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
      icon={<IconX strokeWidth='2.5' size={16} />}
    />
  )
}

const styles = css.create({
  root: {
    [buttonTokens.containerColor]: palette.surfaceContainer,
    [buttonTokens.labelTextColor]: palette.onSurface,
    position: 'absolute',
    right: 12,
    top: 22,
    color: 'white',
    zIndex: 1000,
  },
})
