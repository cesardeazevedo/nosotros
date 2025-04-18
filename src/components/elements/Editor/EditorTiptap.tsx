import { useCurrentPubkey, useCurrentSigner, useGlobalSettings, useRootContext } from '@/hooks/useRootStore'
import { type EditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { EditorContent as TiptapEditorContent } from '@tiptap/react'
import { observer } from 'mobx-react-lite'
import { useEffect, useId, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { createEditor } from './utils/createEditor'
import { createEditorKind20 } from './utils/createEditorKind20'

type Props = {
  dense?: boolean
  placeholder?: string
  kind20?: boolean
  store: EditorStore
}

export const EditorTiptap = observer(function EditorTiptap(props: Props) {
  const { dense, store, kind20 = false } = props
  const id = useId()

  const pubkey = useCurrentPubkey()
  const context = useRootContext()
  const signer = useCurrentSigner()
  const globalSettings = useGlobalSettings()
  const editor = useMemo(
    () => store.editor || (kind20 ? createEditorKind20(store) : createEditor(store, globalSettings)),
    [],
  )

  useEffect(() => {
    store.setEditor(editor)
  }, [store, editor])

  useEffect(() => {
    if (signer) {
      store.setSigner(signer)
    }
    store.setContext({ ...context, pubkey }, globalSettings)
  }, [context, pubkey])

  return (
    <TiptapEditorContent
      id={id}
      editor={editor}
      {...css.props([styles.root, dense && styles.root$dense, !store.open && styles.root$disabled])}
    />
  )
})

const styles = css.create({
  root: {
    flex: '1 1 auto',
    fontSize: '118%',
    fontWeight: 500,
    minHeight: 50,
    width: '100%',
    paddingTop: spacing.padding1,
    paddingBottom: spacing.padding1,
    paddingRight: spacing.padding2,
  },
  root$disabled: {
    minHeight: 40,
  },
  root$dense: {
    minHeight: 40,
  },
})
