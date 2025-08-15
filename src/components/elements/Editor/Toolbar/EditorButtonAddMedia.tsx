import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconPhotoPlus } from '@tabler/icons-react'
import { memo } from 'react'
import { useEditorSelector } from '../hooks/useEditor'

type Props = IconButtonProps & {}

export const EditorButtonAddMedia = memo(function EditorButtonAddMedia(props: Props) {
  const { ...rest } = props
  const selectFiles = useEditorSelector((editor) => editor.selectFiles)
  const { dense } = useContentContext()
  return (
    <Tooltip cursor='arrow' text='Add Media' enterDelay={200}>
      <IconButton
        size={dense ? 'sm' : 'md'}
        icon={<IconPhotoPlus size={dense ? 20 : 22} strokeWidth='1.6' />}
        onClick={selectFiles}
        {...rest}
      />
    </Tooltip>
  )
})
