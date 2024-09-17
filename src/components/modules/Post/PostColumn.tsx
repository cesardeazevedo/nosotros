import PaperContainer from '@/components/elements/Layouts/PaperContainer'
import { Text } from '@/components/ui/Text/Text'
import DeckColumnHeader from 'components/elements/Deck/DeckColumnHeader'
import Post from 'components/elements/Posts/Post'
import { useModuleSubscription } from 'hooks/useFeedSubscription'
import { observer } from 'mobx-react-lite'
import type { NoteModule } from 'stores/modules/note.module'

type Props = {
  module: NoteModule
}

const PostColumn = observer(function PostColumn(props: Props) {
  const { module } = props
  useModuleSubscription(module)
  return (
    <>
      <DeckColumnHeader id={module.id} name='Post'>
        <Text variant='title' size='lg'>
          Post
        </Text>
      </DeckColumnHeader>
      {module.note && (
        <PaperContainer shape='none'>
          <Post note={module.note} />
        </PaperContainer>
      )}
    </>
  )
})

export default PostColumn
