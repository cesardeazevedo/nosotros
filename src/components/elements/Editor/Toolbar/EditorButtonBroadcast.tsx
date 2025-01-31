import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { EditorStore } from '@/stores/editor/editor.store'
import { IconServerBolt } from '@tabler/icons-react'
import { forwardRef } from 'react'

type Props = IconButtonProps & {
  store: EditorStore
}

export const EditorButtonBroadcast = forwardRef<HTMLButtonElement, Props>(function EditorButtonBroadcast(
  props: Props,
  ref,
) {
  const { store, ...rest } = props
  const { dense } = useContentContext()
  return (
    <Tooltip cursor='arrow' text='Select relays' enterDelay={200}>
      <IconButton
        {...rest}
        ref={ref}
        toggle={store.section === 'broadcast'}
        selected={store.section === 'broadcast'}
        size={dense ? 'sm' : 'md'}
        icon={<IconServerBolt size={dense ? 20 : 22} strokeWidth='1.6' />}
        onClick={() => store.openSection('broadcast')}
      />
    </Tooltip>
  )
})
