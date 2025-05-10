import { Editor } from '@/components/elements/Editor/Editor'
import { EditorContainer } from '@/components/elements/Editor/EditorContainer'
import { EditorPlaceholder } from '@/components/elements/Editor/EditorPlaceholder'
import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { HomeFeedTabs } from '@/components/modules/Home/HomeFeedTabs'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import type { HomeModule } from '@/stores/modules/home.module'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'

type Props = {
  module?: HomeModule
  renderEditor?: boolean
}

export const HomeHeader = (props: Props) => {
  const { module, renderEditor = true } = props
  const pubkey = useCurrentPubkey()
  return (
    <>
      <FeedHeaderBase feed={module?.feed} leading={<HomeFeedTabs module={module} />} />
      <Divider />
      <Stack horizontal={false} align='stretch' justify='space-between'>
        {module && renderEditor && <Editor initialOpen={false} store={module.feed.editor} />}
        {!module && (
          <EditorContainer open={false}>
            <UserAvatar size='md' pubkey={pubkey} />
            <Stack grow>
              <EditorPlaceholder placeholder="What's in your mind?" />
            </Stack>
          </EditorContainer>
        )}
      </Stack>
    </>
  )
}
