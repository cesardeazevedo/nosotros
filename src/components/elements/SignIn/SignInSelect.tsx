import { Button } from '@/components/ui/Button/Button'
import { buttonTokens } from '@/components/ui/Button/Button.stylex'
import { Card } from '@/components/ui/Card/Card'
import { CardContent } from '@/components/ui/Card/CardContent'
import { CardTitle } from '@/components/ui/Card/CardTitle'
import { chipTokens } from '@/components/ui/Chip/Chip.stylex'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { signinStore } from '@/stores/signin/signin.store'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { IconChevronRight, IconExternalLink, IconEye } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import { Link } from '../Links/Link'
import { SignInHeader } from './SignInHeader'

export const SignInSelect = observer(function SignInSelect() {
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
            <Card variant='filled' sx={styles.card} onClick={() => signinStore.goTo('READ_ONLY')}>
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
            <Card variant='filled' sx={styles.card} onClick={() => signinStore.goTo('NOSTR_EXTENSION')}>
              <Stack align='center'>
                <CardContent>
                  <CardTitle
                    headline={
                      <Stack gap={0.5}>
                        Nostr extension
                        {/* <Chip icon={undefined} variant='suggestion' sx={styles.chip} label='Easy' /> */}
                      </Stack>
                    }
                    subhead={'Sign in using a compatible browser extension'}
                  />
                </CardContent>
                <CardContent>
                  <IconChevronRight />
                </CardContent>
              </Stack>
            </Card>
            <Card variant='filled' sx={styles.card} onClick={() => signinStore.goTo('REMOTE_SIGN')}>
              <Stack grow align='stretch'>
                <CardContent grow>
                  <CardTitle
                    headline={
                      <Stack horizontal={false} align='flex-start' gap={0.5}>
                        Remote signer
                        {/* <Chip sx={styles.chip} label='Advanced' /> */}
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
              </Stack>
            </Card>
            <Card disabled variant='filled' sx={styles.card} onClick={() => {}}>
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
          <Divider inset>Create acount comming soon</Divider>
          <Link href='https://nosta.me'>
            <Button fullWidth variant='filled' sx={styles.button}>
              <Stack justify='center' gap={1}>
                Create Account on nosta.me
                <IconExternalLink size={16} style={{ marginRight: -16 }} />
              </Stack>
            </Button>
          </Link>
        </Stack>
      </Stack>
    </>
  )
})

const styles = css.create({
  card: {
    flex: 1,
    width: '100%',
    height: 40,
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
    padding: spacing.padding4,
    paddingTop: spacing['padding0.5'],
  },
  button: {
    height: 50,
  },
})
