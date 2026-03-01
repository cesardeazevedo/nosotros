import { memo, Suspense, lazy } from 'react'
import type { EditorProviderProps } from './EditorContext'
import { EditorPlaceholder } from './EditorPlaceholder'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { Stack } from '@/components/ui/Stack/Stack'
import { UserAvatar } from '../User/UserAvatar'
import { EditorContainer } from './EditorContainer'

export { EditorContext } from './EditorContext'
export type { EditorContextType, EditorProviderProps, EditorRef, EditorState } from './EditorContext'

const EditorProviderLazy = lazy(async () =>
  import('./EditorProviderImpl').then((m) => ({ default: m.EditorProviderImpl })),
)

export const EditorProvider = memo(function EditorProvider(props: EditorProviderProps) {
  const pubkey = useCurrentPubkey()
  return (
    <Suspense fallback={
      <EditorContainer>
        {pubkey && <UserAvatar pubkey={pubkey} />}
        <Stack horizontal={false} align='stretch' justify={'center'} grow>
          <EditorPlaceholder placeholder="What's on your mind?" />
        </Stack>
      </EditorContainer>
    }>
      <EditorProviderLazy {...props} />
    </Suspense>
  )
})
