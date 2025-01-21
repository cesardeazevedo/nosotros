import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { EditorStore } from '@/stores/editor/editor.store'
import { IconSettings } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { forwardRef } from 'react'

type Props = IconButtonProps & {
  store: EditorStore
  dense?: boolean
}

export const EditorButtonSettings = observer(
  forwardRef<HTMLButtonElement, Props>(function EditorButtonSettings(props: Props, ref) {
    const { store, dense, ...rest } = props
    return (
      <Tooltip cursor='arrow' text='Settings' enterDelay={200}>
        <IconButton
          {...rest}
          ref={ref}
          selected={store.section === 'settings'}
          toggle={store.section === 'settings'}
          size={dense ? 'sm' : 'md'}
          icon={<IconSettings size={dense ? 20 : 22} strokeWidth='1.6' />}
          onClick={() => store.openSection('settings')}
        />
      </Tooltip>
    )
  }),
)
