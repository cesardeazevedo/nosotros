import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentUser } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'
import { LinkSignIn } from '../Links/LinkSignIn'
import { UserName } from '../User/UserName'

export const EditorHeader = observer(function EditorHeader() {
  const user = useCurrentUser()
  return (
    <>
      {user ? (
        <UserName disableLink disablePopover pubkey={user.pubkey} />
      ) : (
        <Stack gap={1}>
          <Text variant='title' size='sm'>
            Post Anonymously
          </Text>
          <LinkSignIn>
            <Text variant='title' size='sm'>
              or Signin
            </Text>
          </LinkSignIn>
        </Stack>
      )}
    </>
  )
})
