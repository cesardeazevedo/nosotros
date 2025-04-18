import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { EditorStore } from '@/stores/editor/editor.store'
import { IconMoodSmile } from '@tabler/icons-react'
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react'
import { observer } from 'mobx-react-lite'

type Props = IconButtonProps & {
  store: EditorStore
}

export const EditorButtonReactions = observer(function EditorButtonReactions(props: Props) {
  const { store, ...rest } = props
  const { dense } = useContentContext()
  return (
    <PopoverBase
      placement='bottom-start'
      opened={store.section === 'reactions'}
      onClose={() => store.openSection('reactions')}
      contentRenderer={({ close }) => (
        <EmojiPicker
          open
          theme={Theme.AUTO}
          emojiStyle={EmojiStyle.NATIVE}
          previewConfig={{ showPreview: false }}
          onEmojiClick={({ emoji }) => {
            close()
            store.editor?.chain().insertContent(emoji).focus().run()
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
            onClick={() => store.openSection('reactions')}
          />
        </Tooltip>
      )}
    </PopoverBase>
  )
})
