import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { EditorStore } from '@/stores/editor/editor.store'
import { IconAt } from '@tabler/icons-react'
import { forwardRef } from 'react'

type Props = IconButtonProps & {
  store: EditorStore
  dense?: boolean
}

export const EditorButtonMentions = forwardRef<HTMLButtonElement, Props>(function EditorButtonMentions(
  props: Props,
  ref,
) {
  const { store, dense, ...rest } = props
  return (
    <Tooltip cursor='arrow' text='Mentions' enterDelay={200}>
      <IconButton
        {...rest}
        ref={ref}
        toggle={store.section === 'mentions'}
        selected={store.section === 'mentions'}
        size={dense ? 'sm' : 'md'}
        icon={<IconAt size={dense ? 20 : 22} strokeWidth='1.6' />}
        onClick={() => store.openSection('mentions')}
      />
    </Tooltip>
  )
})
