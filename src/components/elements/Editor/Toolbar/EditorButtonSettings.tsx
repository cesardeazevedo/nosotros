import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconSettings } from '@tabler/icons-react'
import type { RefObject } from 'react'
import { memo } from 'react'
import { useEditorSection } from '../hooks/useEditor'

type Props = IconButtonProps & {
  ref?: RefObject<HTMLButtonElement>
}

export const EditorButtonSettings = memo(function EditorButtonSettings(props: Props) {
  const { ...rest } = props
  const { dense } = useContentContext()
  const { section, openSection } = useEditorSection()
  return (
    <Tooltip cursor='arrow' text='Settings' enterDelay={200}>
      <IconButton
        {...rest}
        selected={section === 'settings'}
        toggle={section === 'settings'}
        size={dense ? 'sm' : 'md'}
        icon={<IconSettings size={dense ? 20 : 22} strokeWidth='1.6' />}
        onClick={() => openSection('settings')}
      />
    </Tooltip>
  )
})
