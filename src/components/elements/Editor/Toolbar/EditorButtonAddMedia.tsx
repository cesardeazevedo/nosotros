import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { EditorStore } from '@/stores/editor/editor.store'
import { IconPhotoPlus } from '@tabler/icons-react'

type Props = IconButtonProps & {
  dense?: boolean
  store: EditorStore
}

export const EditorButtonAddMedia = function EditorButtonAddMedia(props: Props) {
  const { store, dense, ...rest } = props
  return (
    <Tooltip cursor='arrow' text='Add Media' enterDelay={200}>
      <IconButton
        size={dense ? 'sm' : 'md'}
        icon={<IconPhotoPlus size={dense ? 20 : 22} strokeWidth='1.6' />}
        onClick={store.selectFiles}
        {...rest}
      />
    </Tooltip>
  )
}
