import { Button } from '@/components/ui/Button/Button'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { useGoBack } from '@/hooks/useNavigations'
import { signinStore } from '@/stores/signin/signin.store'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconCircleCheck } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'
import { Link } from '../Links/Link'
import { SignInHeader } from './SignInHeader'

export const SignInRemoteSigner = observer(function SignInRemoteSigner() {
  const goBack = useGoBack()

  const handleSubmit = useCallback(async () => {
    await signinStore.submitBunker()
    setTimeout(() => {
      goBack()
    }, 700)
  }, [])

  return (
    <Stack horizontal={false} align='center' justify='flex-start' sx={styles.root}>
      <SignInHeader>
        <Text variant='headline'>Sign In with a Remote Signer</Text>
      </SignInHeader>
      <Stack grow horizontal={false} sx={styles.content} gap={4} justify='space-between'>
        <Stack grow horizontal={false} gap={4} justify='space-between'>
          <Text size='lg'>
            This method involves a 2-way communication between the client and a remote signer (also known as "bunker"),
            this is the <b>recommended</b> way to keep your nsec secure and outside the client, while allowing you to
            sign notes.
            <Link href='https://github.com/nostr-protocol/nips/blob/master/46.md'>read more</Link>
          </Text>
          <Stack grow horizontal={false} gap={2}>
            <TextField
              shrink
              multiline
              rows={5}
              label='Bunker URL'
              placeholder='bunker://'
              sx={styles.textarea}
              defaultValue={signinStore.bunkerUrl}
              onChange={(e) => signinStore.setBunker(e.target.value)}
            />
            {signinStore.error && (
              <Paper surface='errorContainer' sx={styles.response}>
                <Text variant='body' size='lg'>
                  {signinStore.error}
                </Text>
              </Paper>
            )}
            {signinStore.response && (
              <Paper surface='surfaceContainer' sx={styles.response}>
                <Stack align='center' justify='center' gap={1}>
                  <IconCircleCheck size={18} {...css.props(styles.iconSuccess)} />
                  <Text variant='body' size='lg'>
                    {signinStore.response}
                  </Text>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Stack>
        {/* <Divider>OR</Divider> */}
        {/* <Button variant='outlined' sx={styles.button} onClick={() => signinStore.goTo('REMOTE_SIGN_NOSTR_CONNECT')}> */}
        {/*   Get NostrConnect URL */}
        {/* </Button> */}
        <Button variant='filled' sx={styles.button} disabled={!signinStore.bunkerUrl} onClick={handleSubmit}>
          Connect
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
    padding: spacing.padding4,
    paddingTop: spacing.padding1,
  },
  textarea: {
    wordBreak: 'break-all',
    fontFamily: 'monospace',
    [typeScale.bodyLineHeight$lg]: '22px',
    [typeScale.bodyLetterSpacing$lg]: '0px',
  },
  button: {
    height: 50,
  },
  response: {
    flexGrow: 0,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.padding2,
  },
  iconSuccess: {
    color: colors.green7,
  },
})
