import { Editor } from '@/components/elements/Editor/Editor'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { useMobile } from '@/hooks/useMobile'
import { createEditorStore } from '@/stores/editor/editor.store'
import { useState } from 'react'

export const EditorRoute = () => {
  const [editor] = useState(createEditorStore({}))
  const isMobile = useMobile()
  return (
    <CenteredContainer margin>
      <PaperContainer elevation={isMobile ? 0 : 1}>
        <Editor store={editor} />
      </PaperContainer>
    </CenteredContainer>
  )
}
