import { Button } from '@/components/ui/Button/Button'
import { buttonTokens } from '@/components/ui/Button/Button.stylex'
import { Card } from '@/components/ui/Card/Card'
import { CardContent } from '@/components/ui/Card/CardContent'
import { CardTitle } from '@/components/ui/Card/CardTitle'
import { chipTokens } from '@/components/ui/Chip/Chip.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGoBack } from '@/hooks/useNavigations'
import { signinStore } from '@/stores/signin/signin.store'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { IconChevronRight, IconExternalLink, IconEye } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { NstartModal } from 'nstart-modal'
import { css } from 'react-strict-dom'
import { SignInHeader } from './SignInHeader'

export const SignInSelect = observer(function SignInSelect() {
  const goBack = useGoBack()
  const navigate = useNavigate()

  const handleSignUpClick = () => {
    const wizard = new NstartModal({
      baseUrl: 'https://start.njump.me',
      an: 'Nosotros', // appName
      afb: true, // skipBunker
      asb: false, // skipBunker
      aan: true, // avoidNsec
      aac: false, // avoidNcryptsec
      arr: ['wss://nos.lol', 'wss://nostr.mom', 'wss://relay.damus.io'],
      awr: ['wss://nos.lol', 'wss://nostr.mom', 'wss://relay.damus.io'],
      onComplete: async (result) => {
        if (result.nostrLogin.startsWith('bunker://')) {
          await signinStore.submitBunker(result.nostrLogin)
        }
        navigate({ to: '/', search: {}, replace: true })
      },
    })
    wizard.open()
  }

  return (
    <>
      <Stack horizontal={false} align='center' justify='flex-start' sx={styles.root}>
        <SignInHeader>
          <Text variant='headline' size='sm'>
            Choose a sign in method
          </Text>
        </SignInHeader>
        <Stack horizontal={false} gap={4} align='center' justify='flex-start' sx={styles.content}>
          <Stack horizontal={false} gap={1} align='center'>
            <Card
              variant='filled'
              surface='surfaceContainer'
              sx={styles.card}
              onClick={() => signinStore.goTo('READ_ONLY')}>
              <Stack align='center'>
                <CardContent grow>
                  <CardTitle
                    headline={
                      <Stack justify='center' gap={0.5}>
                        Read only <IconEye size={18} strokeWidth='2.2' style={{ marginTop: 4 }} />
                      </Stack>
                    }
                    subhead={'Sign In with any npub, nprofile or a nostr address in read-only mode'}
                  />
                </CardContent>
                <CardContent>
                  <IconChevronRight />
                </CardContent>
              </Stack>
            </Card>
            <Card
              variant='filled'
              surface='surfaceContainer'
              sx={styles.card}
              onClick={async () => {
                if (signinStore.hasExtension.current()) {
                  await signinStore.submitNostrExtension()
                  goBack()
                }
                signinStore.goTo('NOSTR_EXTENSION')
              }}>
              <Stack grow justify='space-between'>
                <CardContent>
                  <CardTitle headline={'Nostr extension'} subhead={'Sign in using a compatible browser extension'} />
                </CardContent>
                <CardContent>
                  <IconChevronRight />
                </CardContent>
              </Stack>
            </Card>
            <Card
              variant='filled'
              surface='surfaceContainer'
              sx={styles.card}
              onClick={() => signinStore.goTo('REMOTE_SIGN')}>
              <CardContent grow>
                <CardTitle
                  headline={
                    <Stack horizontal={false} align='flex-start' gap={0.5}>
                      Remote signer
                    </Stack>
                  }
                  subhead={
                    'Your private key is managed by a separate application that authorizes actions without direct exposure'
                  }
                />
              </CardContent>
              <CardContent>
                <IconChevronRight />
              </CardContent>
            </Card>
            <Card disabled variant='filled' surface='surfaceContainerLow' sx={styles.card} onClick={() => {}}>
              <CardContent>
                <CardTitle
                  headline={
                    <Stack justify='center' gap={0.5}>
                      Private Key (nsec) 🙅
                    </Stack>
                  }
                  subhead={'nsec  is not supported, we do not recommend, never put your nsec'}
                />
              </CardContent>
            </Card>
          </Stack>
          <Text size='md'>Don't have an account yet?</Text>
          <Button fullWidth variant='filled' sx={styles.button} onClick={handleSignUpClick}>
            <Stack justify='center' gap={1}>
              Create account on njump start
              <IconExternalLink size={16} style={{ marginRight: -16 }} />
            </Stack>
          </Button>
        </Stack>
      </Stack>
    </>
  )
})

const styles = css.create({
  card: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    paddingBlock: 12,
    paddingInline: spacing.padding2,
    width: '100%',
  },
  chip: {
    [chipTokens.leadingSpace]: 0,
    [chipTokens.trailingSpace]: 0,
    [chipTokens.containerHeight]: 22,
    [chipTokens.labelTextSize]: typeScale.bodySize$sm,
    [buttonTokens.outlineColor]: 'red',
  },
  root: {
    height: '100%',
  },
  content: {
    padding: spacing.padding2,
    paddingTop: spacing['padding0.5'],
  },
  button: {
    height: 60,
  },
})
