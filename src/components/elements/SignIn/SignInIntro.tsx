import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGoBack } from '@/hooks/useNavigations'
import { signinStore } from '@/stores/ui/signin.store'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css, html } from 'react-strict-dom'
import { Link } from '../Content/Link/Link'

type Props = {
  onClickManual: () => void
}

export const SignInIntro = observer(function SignInIntro(props: Props) {
  const isMobile = useMobile()
  const goBack = useGoBack()

  const handleLoginWithNostrExtension = useCallback(() => {
    signinStore.loginWithNostrExtension()
    goBack()
  }, [])

  return (
    <>
      <Stack horizontal={false} gap={2} align='center' justify='flex-start' sx={styles.root}>
        <Stack align='flex-start' sx={styles.footer}>
          {isMobile && (
            <Text variant='display' size='lg'>
              Sign In
            </Text>
          )}
        </Stack>
        <Stack horizontal={false} gap={4} align='stretch' justify='flex-start' sx={styles.content}>
          <Stack align='center' justify='flex-start' gap={2} horizontal={false}>
            {signinStore.hasExtension && <html.div>Nostr extension detected</html.div>}
            <Button
              fullWidth
              variant='filled'
              sx={styles.button}
              disabled={!signinStore.hasExtension}
              onClick={handleLoginWithNostrExtension}>
              Sign In with Nostr extension
            </Button>
          </Stack>
          <Stack align='center' justify='center' gap={2} horizontal={false}>
            <Text size='lg'>
              {signinStore.hasExtension === false && (
                <strong>
                  Nostr extension not found.
                  <br />
                </strong>
              )}
              It&apos;s recommended you sign in by using a Nostr browser extension such as Alby, Nos2x or{' '}
              <Link href='https://github.com/nostr-protocol/nips/blob/master/07.md'>others</Link>
            </Text>
          </Stack>
          <Divider>OR</Divider>
          <Stack horizontal={false} align='center' gap={3}>
            <Button fullWidth variant='outlined' sx={styles.button} onClick={props.onClickManual}>
              Manually Sign In
            </Button>
            <Text>Sign In with your public key (npub).</Text>
          </Stack>
        </Stack>
      </Stack>
    </>
  )
})

const styles = css.create({
  root: {
    height: '100%',
  },
  content: {
    flex: 1,
  },
  footer: {
    flex: 0.2,
  },
  button: {
    height: 50,
  },
})
