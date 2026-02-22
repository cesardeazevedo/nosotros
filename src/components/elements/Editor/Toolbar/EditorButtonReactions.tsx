import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconMoodSmile } from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { lazy, memo, Suspense } from 'react'
import { useEditorSection, useEditorSelector } from '../hooks/useEditor'

type Props = IconButtonProps & {}

const EmojiPicker = lazy(async () => {
  const mod = await import('emoji-picker-react')
  const Picker = (props: Omit<ComponentProps<typeof mod.default>, 'theme' | 'emojiStyle'>) => (
    <mod.default {...props} theme={mod.Theme.AUTO} emojiStyle={mod.EmojiStyle.NATIVE} />
  )
  return { default: Picker }
})

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
        <Suspense fallback={<></>}>
          <EmojiPicker
            open
            autoFocusSearch={false}
            previewConfig={{ showPreview: false }}
            onEmojiClick={({ emoji }) => {
              editor?.chain().insertContent(emoji).focus().run()
            }}
          />
        </Suspense>
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
