import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { EditorContent as TiptapEditorContent } from '@tiptap/react'
import { memo, useId } from 'react'
import { css } from 'react-strict-dom'
import { EditorDropArea } from './EditorDropArea'
import { useEditorSelector } from './hooks/useEditor'

type Props = {
  dense?: boolean
}

export const EditorTiptap = memo(function EditorTiptap(props: Props) {
  const { dense } = props
  const mobile = useMobile()
  const id = useId()
  const open = useEditorSelector((editor) => editor.open)
  const editor = useEditorSelector((editor) => editor.editor)
  const addUploadFiles = useEditorSelector((editor) => editor.addUploadFiles)

  return (
    <EditorDropArea onFilesDrop={(files) => addUploadFiles(files, editor?.state.selection.from)}>
      <TiptapEditorContent
        id={id}
        editor={editor}
        {...css.props([
          styles.root,
          mobile && styles.root$mobile,
          dense && styles.root$dense,
          !open && styles.root$disabled,
        ])}
      />
    </EditorDropArea>
  )
})

const styles = css.create({
  root: {
    flex: '1 1 auto',
    fontSize: 18,
    fontWeight: 500,
    minHeight: 50,
    width: '100%',
    paddingTop: spacing.padding1,
    paddingBottom: spacing.padding1,
    paddingRight: spacing.padding2,
    maxHeight: 'calc(100vh - 400px)',
    overflowY: 'auto',
  },
  root$mobile: {
    fontWeight: 400,
    maxHeight: 'calc(100vh - 280px)',
  },
  root$disabled: {
    minHeight: 40,
  },
  root$dense: {
    minHeight: 40,
    fontSize: 16,
  },
})
