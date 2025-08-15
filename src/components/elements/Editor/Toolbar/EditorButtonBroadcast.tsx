import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconServerBolt } from '@tabler/icons-react'
import { memo, type Ref } from 'react'
import { useEditorSection } from '../hooks/useEditor'

type Props = IconButtonProps & {
  ref?: Ref<HTMLButtonElement | null>
}

export const EditorButtonBroadcast = memo(function EditorButtonBroadcast(props: Props) {
  const { ref, ...rest } = props
  const { section, openSection } = useEditorSection()
  const { dense } = useContentContext()
  return (
    <Tooltip cursor='arrow' text='Select relays' enterDelay={200}>
      <IconButton
        {...rest}
        ref={ref}
        toggle={section === 'broadcast'}
        selected={section === 'broadcast'}
        size={dense ? 'sm' : 'md'}
        icon={<IconServerBolt size={dense ? 20 : 22} strokeWidth='1.6' />}
        onClick={() => openSection('broadcast')}
      />
    </Tooltip>
  )
})
