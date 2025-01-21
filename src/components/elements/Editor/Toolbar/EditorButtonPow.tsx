import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { EditorStore } from '@/stores/editor/editor.store'
import { IconCpu } from '@tabler/icons-react'
import { forwardRef } from 'react'

type Props = IconButtonProps & {
  store: EditorStore
  dense?: boolean
}

export const EditorButtonPow = forwardRef<HTMLButtonElement, Props>(function EditorButtonPow(props: Props, ref) {
  const { store, dense, ...rest } = props
  return (
    <Tooltip cursor='arrow' text='Proof of Work (PoW)' enterDelay={200}>
      <IconButton
        {...rest}
        ref={ref}
        toggle={store.section === 'pow'}
        size={dense ? 'sm' : 'md'}
        icon={<IconCpu size={dense ? 20 : 22} strokeWidth='1.6' />}
        onClick={() => store.openSection('pow')}
      />
    </Tooltip>
  )
})
