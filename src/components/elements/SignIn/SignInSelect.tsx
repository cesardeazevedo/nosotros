import { goToAtom, hasExtensionAtom, submitNostrExtensionAtom } from '@/atoms/signin.atoms'
import { Button } from '@/components/ui/Button/Button'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGoBack } from '@/hooks/useNavigations'
import { duration } from '@/themes/duration.stylex'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronRight, IconExternalLink, IconEye } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { NstartModal } from 'nstart-modal'
import { css } from 'react-strict-dom'
import { ContentLink } from '../Content/Link/Link'
import { SignInHeader } from './SignInHeader'

export const SignInSelect = () => {
  const goBack = useGoBack()
  const navigate = useNavigate()
  const goTo = useSetAtom(goToAtom)
  const submitWithExtension = useSetAtom(submitNostrExtensionAtom)
  const hasExtension = useAtomValue(hasExtensionAtom)

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
      onComplete: async () => {
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
          <Stack horizontal={false} gap={1} align='center' sx={styles.list}>
            <ListItem
              onClick={() => goTo('READ_ONLY')}
              supportingText='Sign In with any npub, nprofile or a nostr address in read-only mode'
              trailingIcon={<IconChevronRight />}
              sx={styles.item}>
              <Stack gap={0.5} sx={styles.label}>
                Read only <IconEye size={18} strokeWidth='2.2' />
              </Stack>
            </ListItem>
            <ListItem
              onClick={async () => {
                if (hasExtension) {
                  try {
                    await submitWithExtension()
                    goBack()
                    return
                  } catch {
                    // fall through to extension page
                  }
                }
                goTo('NOSTR_EXTENSION')
              }}
              supportingText='Sign in using a compatible browser extension'
              trailingIcon={<IconChevronRight />}
              sx={styles.item}>
              Nostr extension
            </ListItem>
            <ListItem
              onClick={() => goTo('REMOTE_SIGN')}
              supportingText='Your private key is managed by a separate application that authorizes actions without direct exposure'
              trailingIcon={<IconChevronRight />}
              sx={styles.item}>
              Remote signer
            </ListItem>
            <ContentLink underline={false} href='https://nostrapps.com/#signers' sx={styles.link}>
              <ListItem
                interactive
                supportingText={
                  <>
                    nsec is not supported, it's not recommended to put your nsec in any app or website, choose a nostr
                    signer app
                    <IconExternalLink size={14} style={{ marginLeft: 4, display: 'inline' }} />
                  </>
                }
                sx={styles.item}>
                Private Key (nsec) 🙅
              </ListItem>
            </ContentLink>
          </Stack>
          <Text size='md'>Don't have an account yet?</Text>
          <Button fullWidth variant='filled' sx={styles.button} onClick={handleSignUpClick}>
            <Stack justify='center' gap={1} sx={styles.label}>
              Create account on njump start
              <IconExternalLink size={16} />
            </Stack>
          </Button>
        </Stack>
      </Stack>
    </>
  )
}

const styles = css.create({
  root: {
    height: '100%',
  },
  content: {
    padding: spacing.padding2,
    paddingTop: spacing['padding0.5'],
  },
  list: {
    width: '100%',
  },
  link: {
    width: '100%',
  },
  item: {
    width: '100%',
    paddingBlock: spacing.padding1,
    minHeight: 72,
    transitionProperty: 'background-color',
    transitionDuration: duration.short2,
    backgroundColor: {
      ':hover': palette.surfaceContainerHighest,
      default: palette.surfaceContainerHigh,
    },
  },
  button: {
    height: 60,
  },
  label: {
    alignItems: 'center',
  },
})
