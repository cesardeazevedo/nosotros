import { spacing } from '@/themes/spacing.stylex'
import { EditorContent as TiptapEditorContent } from '@tiptap/react'
import { memo, useId } from 'react'
import { css } from 'react-strict-dom'
import { useEditorSelector } from './hooks/useEditor'

type Props = {
  dense?: boolean
}

export const EditorTiptap = memo(function EditorTiptap(props: Props) {
  const { dense } = props
  const id = useId()
  const open = useEditorSelector((editor) => editor.open)
  const editor = useEditorSelector((editor) => editor.editor)

  return (
    <TiptapEditorContent
      id={id}
      editor={editor}
      {...css.props([styles.root, dense && styles.root$dense, !open && styles.root$disabled])}
    />
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
    maxHeight: 700,
    overflowY: 'auto',
  },
  root$disabled: {
    minHeight: 40,
  },
  root$dense: {
    minHeight: 40,
    fontSize: 16,
  },
})
