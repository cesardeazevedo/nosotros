import { duration } from '@/themes/duration.stylex'
import { IconChevronRight } from '@tabler/icons-react'
import { css } from 'react-strict-dom'

type Props = {
  size?: number
  upwards?: boolean
  strokeWidth?: string
  expanded?: boolean
}

export const IconExpandable = (props: Props) => {
  const { size = 18, strokeWidth = '1.8', expanded = false, upwards = false } = props
  const iconProps = { size, strokeWidth }
  return (
    <IconChevronRight
      {...iconProps}
      {...css.props([styles.icon, upwards && styles.upward, expanded && styles.expanded])}
    />
  )
}

const styles = css.create({
  icon: {
    transition: 'transform',
    transitionDuration: duration.short3,
  },
  upward: {
    transform: 'rotateZ(-90deg)',
  },
  expanded: {
    transform: 'rotateZ(90deg)',
  },
})
