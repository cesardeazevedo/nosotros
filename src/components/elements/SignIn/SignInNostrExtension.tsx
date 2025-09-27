import { hasExtensionAtom, submitNostrExtensionAtom } from '@/atoms/signin.atoms'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGoBack } from '@/hooks/useNavigations'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo, useCallback } from 'react'
import { css } from 'react-strict-dom'
import { ContentLink } from '../Content/Link/Link'
import { SignInHeader } from './SignInHeader'

export const SignInNostrExtension = memo(function SignInNostrExtension() {
  const goBack = useGoBack()
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const submitExtension = useSetAtom(submitNostrExtensionAtom)
  const hasExtension = useAtomValue(hasExtensionAtom)

  const handleSubmit = useCallback(async () => {
    try {
      await submitExtension()
      goBack()
    } catch (err) {
      const error = err as Error
      enqueueToast({ component: error.message })
      goBack()
    }
  }, [])

  return (
    <Stack horizontal={false} align='center' justify='flex-start' sx={styles.root}>
      <SignInHeader>
        <Text variant='headline'>Sign In with Nostr Extension</Text>
      </SignInHeader>
      <Stack horizontal={false} align='stretch' justify='flex-start' sx={styles.content}>
        <Stack horizontal={false} grow justify='center' align='center' gap={4}>
          {hasExtension === false && (
            <Stack justify='center' sx={styles.notfound}>
              <Text variant='title' size='lg'>
                <strong>
                  Nostr extension not found.
                  <br />
                </strong>
              </Text>
            </Stack>
          )}
          <Text size='lg'>
            You can sign in by using a Nostr browser extension such as Alby, Nos2x or{' '}
            <ContentLink href='https://nostrapps.com/#signers#all'>others</ContentLink>
          </Text>
        </Stack>
        <Button variant='filled' sx={styles.button} onClick={handleSubmit} disabled={!hasExtension}>
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
    textAlign: 'center',
    padding: spacing.padding4,
  },
  button: {
    height: 50,
  },
  notfound: {
    color: palette.error,
  },
})
