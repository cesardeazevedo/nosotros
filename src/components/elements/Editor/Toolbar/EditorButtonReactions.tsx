import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconMoodSmile } from '@tabler/icons-react'
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react'
import { memo } from 'react'
import { useEditorSection, useEditorSelector } from '../hooks/useEditor'

type Props = IconButtonProps & {}

export const EditorButtonReactions = memo(function EditorButtonReactions(props: Props) {
  const { ...rest } = props
  const { dense } = useContentContext()
  const { section, openSection } = useEditorSection()
  const editor = useEditorSelector((editor) => editor.editor)

  return (
    <PopoverBase
      placement='bottom-start'
      opened={section === 'reactions'}
      onClose={() => openSection('reactions')}
      contentRenderer={() => (
        <EmojiPicker
          open
          autoFocusSearch={false}
          theme={Theme.AUTO}
          emojiStyle={EmojiStyle.NATIVE}
          previewConfig={{ showPreview: false }}
          onEmojiClick={({ emoji }) => {
            editor?.chain().insertContent(emoji).focus().run()
          }}
        />
      )}>
      {({ getProps, setRef, opened }) => (
        <Tooltip cursor='arrow' text='Reactions' enterDelay={200}>
          <IconButton
            {...rest}
            {...getProps()}
            ref={setRef}
            toggle={opened}
            selected={opened}
            size={dense ? 'sm' : 'md'}
            icon={<IconMoodSmile size={dense ? 20 : 22} strokeWidth='1.6' />}
            onClick={() => openSection('reactions')}
          />
        </Tooltip>
      )}
    </PopoverBase>
  )
})
