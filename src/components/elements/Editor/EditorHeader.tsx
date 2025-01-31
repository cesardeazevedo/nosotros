import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'
import { LinkSignIn } from '../Links/LinkSignIn'
import { UserName } from '../User/UserName'

export const EditorHeader = observer(function EditorHeader() {
  const pubkey = useCurrentPubkey()
  return (
    <>
      {pubkey ? (
        <UserName pubkey={pubkey} />
      ) : (
        <LinkSignIn>
          <Stack gap={1}>
            <Text variant='title' size='md'>
              Signin
            </Text>
          </Stack>
        </LinkSignIn>
      )}
    </>
  )
})
