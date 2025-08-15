import { EditorProvider } from '@/components/elements/Editor/EditorProvider'
import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'

export const EditorRoute = () => {
  return (
    <CenteredContainer margin>
      <PaperContainer>
        <EditorProvider />
      </PaperContainer>
    </CenteredContainer>
  )
}
