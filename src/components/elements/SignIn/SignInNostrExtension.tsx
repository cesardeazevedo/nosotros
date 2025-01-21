import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGoBack } from '@/hooks/useNavigations'
import { signinStore } from '@/stores/signin/signin.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'
import { ContentLink } from '../Content/Link/Link'
import { SignInHeader } from './SignInHeader'

export const SignInNostrExtension = observer(function SignInNostrExtension() {
  const goBack = useGoBack()

  const handleSubmit = useCallback(() => {
    signinStore.submitNostrExtension()
    goBack()
  }, [])

  return (
    <Stack horizontal={false} align='center' justify='flex-start' sx={styles.root}>
      <SignInHeader>
        <Text variant='headline'>Sign In with Nostr Extension</Text>
      </SignInHeader>
      <Stack horizontal={false} align='stretch' justify='space-between' sx={styles.content}>
        <Text size='lg'>
          {signinStore.hasExtension.current() === false && (
            <strong>
              Nostr extension not found.
              <br />
            </strong>
          )}
          You can sign in by using a Nostr browser extension such as Alby, Nos2x or{' '}
          <ContentLink href='https://github.com/nostr-protocol/nips/blob/master/07.md'>others</ContentLink>
        </Text>
        <Button variant='filled' sx={styles.button} onClick={handleSubmit}>
          Sign In with Extension
        </Button>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    height: '100%',
  },
  content: {
    height: '100%',
    padding: spacing.padding4,
  },
  button: {
    height: 50,
  },
})
