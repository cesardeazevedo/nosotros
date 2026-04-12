import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconMoodSmile } from '@tabler/icons-react'
import { memo } from 'react'
import { EditorEmojiPopover } from './EditorEmojiPopover'
import { useInstalledCustomEmojis } from '../hooks/useInstalledCustomEmojis'
import { useEditorSection, useEditorSelector } from '../hooks/useEditor'

type Props = IconButtonProps & {}

export const EditorButtonReactions = memo(function EditorButtonReactions(props: Props) {
  const { ...rest } = props
  const { dense } = useContentContext()
  const { section, openSection } = useEditorSection()
  const editor = useEditorSelector((state) => state.editor)
  const { customEmojis } = useInstalledCustomEmojis()

  return (
    <EditorEmojiPopover
      editor={editor}
      customEmojis={customEmojis}
      placement='bottom-start'
      opened={section === 'reactions'}
      onClose={() => openSection('reactions')}>
      {({ getProps, setRef, opened }) => (
        <Tooltip cursor='arrow' text='Reactions' enterDelay={200}>
          <IconButton
            {...rest}
            {...getProps()}
            ref={setRef}
            selected={opened}
            size={dense ? 'sm' : 'md'}
            icon={<IconMoodSmile size={dense ? 20 : 22} strokeWidth='1.6' />}
            onClick={() => openSection('reactions')}
          />
        </Tooltip>
      )}
    </EditorEmojiPopover>
  )
})
