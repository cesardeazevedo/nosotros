import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import type { IPopoverBaseTriggerRendererProps } from '@/components/ui/Popover/PopoverBase.types'
import type { Editor as TiptapEditor } from '@tiptap/react'
import type { Placement } from '@floating-ui/react'
import type { ComponentProps, ReactNode } from 'react'
import { lazy, memo, Suspense } from 'react'

export type EditorCustomEmoji = {
  id: string
  names: string[]
  imgUrl: string
}

type Props = {
  editor: TiptapEditor | null
  customEmojis: EditorCustomEmoji[]
  opened: boolean
  onClose: () => void
  placement?: Placement
  children: ReactNode | ((props: IPopoverBaseTriggerRendererProps) => ReactNode)
}

const EmojiPicker = lazy(async () => {
  const mod = await import('emoji-picker-react')
  const Picker = (props: Omit<ComponentProps<typeof mod.default>, 'theme' | 'emojiStyle'>) => (
    <mod.default {...props} theme={mod.Theme.AUTO} emojiStyle={mod.EmojiStyle.NATIVE} />
  )
  return { default: Picker }
})

function insertEmoji(
  editor: TiptapEditor | null,
  emojiData: {
    emoji: string
    isCustom?: boolean
    names: string[]
    imageUrl?: string
  },
) {
  if (emojiData.isCustom && emojiData.names[0] && emojiData.imageUrl) {
    editor
      ?.chain()
      .insertContent({
        type: 'emoji',
        attrs: {
          name: emojiData.names[0],
          src: emojiData.imageUrl,
        },
      })
      .focus()
      .run()
    return
  }
  editor?.chain().insertContent(emojiData.emoji).focus().run()
}

export const EditorEmojiPopover = memo(function EditorEmojiPopover(props: Props) {
  const { editor, customEmojis, opened, onClose, placement = 'bottom-start', children } = props

  return (
    <PopoverBase
      placement={placement}
      opened={opened}
      onClose={onClose}
      contentRenderer={() => (
        <Suspense fallback={<></>}>
          <EmojiPicker
            open
            autoFocusSearch={false}
            previewConfig={{ showPreview: false }}
            customEmojis={customEmojis}
            onEmojiClick={(emojiData) => {
              insertEmoji(editor, emojiData)
              onClose()
            }}
          />
        </Suspense>
      )}>
      {children}
    </PopoverBase>
  )
})
