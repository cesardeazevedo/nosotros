import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconCpu } from '@tabler/icons-react'
import type { RefObject } from 'react'
import { memo } from 'react'
import { useEditorSection } from '../hooks/useEditor'

type Props = IconButtonProps & {
  dense?: boolean
  ref?: RefObject<HTMLButtonElement>
}

export const EditorButtonPow = memo(function EditorButtonPow(props: Props) {
  const { dense, ...rest } = props
  const { section, openSection } = useEditorSection()
  return (
    <Tooltip cursor='arrow' text='Proof of Work (PoW)' enterDelay={200}>
      <IconButton
        {...rest}
        toggle={section === 'pow'}
        size={dense ? 'sm' : 'md'}
        icon={<IconCpu size={dense ? 20 : 22} strokeWidth='1.6' />}
        onClick={() => openSection('pow')}
      />
    </Tooltip>
  )
})
