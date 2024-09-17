import { useMergeRefs } from '@floating-ui/react'
import { IconCaretLeftFilled, IconCaretRightFilled } from '@tabler/icons-react'
import { forwardRef, useContext } from 'react'
import { MenuContext } from '../Menu/MenuContext'
import type { Props as MenuItemProps } from './MenuItem'
import { MenuItem } from './MenuItem'

type Props = MenuItemProps & {}

export const MenuNestedItem = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { ...other } = props
  const menuContext = useContext(MenuContext)
  const handleRef = useMergeRefs([menuContext.triggerRef, ref])
  return (
    <MenuItem
      trailingIcon={!menuContext.placement?.startsWith('left-') && <IconCaretRightFilled size={18} />}
      leadingIcon={menuContext.placement?.startsWith('left-') && <IconCaretLeftFilled size={18} />}
      keepOpenOnClick={true}
      {...other}
      {...menuContext.getTriggerProps()}
      ref={handleRef}
    />
  )
})
