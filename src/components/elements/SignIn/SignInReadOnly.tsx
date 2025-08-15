import { toggleCameraDialogAtom } from '@/atoms/dialog.atoms'
import {
  inputPubkeyAtom,
  setReadonlyInputAtom,
  signinErrorAtom,
  submitNostrAddressAtom,
  submitReadOnlyAtom,
} from '@/atoms/signin.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { useEventFromNIP19 } from '@/hooks/query/useQueryBase'
import { useGoBack } from '@/hooks/useNavigations'
import { spacing } from '@/themes/spacing.stylex'
import { IconClipboardCopy, IconScan } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo, useActionState, useCallback, useRef } from 'react'
import { css } from 'react-strict-dom'
import invariant from 'tiny-invariant'
import { decodeNIP19 } from 'utils/nip19'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { SignInHeader } from './SignInHeader'

const SignInPreview = memo(function SignInUserPreview() {
  const input = useAtomValue(inputPubkeyAtom)
  const { data: event } = useEventFromNIP19(input)

  return (
    event && (
      <ContentProvider value={{ disableLink: true, disablePopover: true }}>
        <Stack horizontal={false} gap={2} justify='flex-end' align='center'>
          {!event ? (
            <Skeleton variant='circular' sx={styles.loading} />
          ) : (
            <UserAvatar pubkey={event.pubkey} size='lg' />
          )}
          {event && <UserName variant='title' size='lg' pubkey={event.pubkey} />}
        </Stack>
      </ContentProvider>
    )
  )
})

export const SignInReadOnly = memo(function SignInForm() {
  const isMobile = useMobile()
  const goBack = useGoBack()
  const ref = useRef<HTMLInputElement>(null)

  const errorMsg = useAtomValue(signinErrorAtom)
  const toggleCamera = useSetAtom(toggleCameraDialogAtom)

  const setInput = useSetAtom(setReadonlyInputAtom)
  const setSigninError = useSetAtom(signinErrorAtom)
  const submitNostrAddress = useSetAtom(submitNostrAddressAtom)
  const submitReadOnly = useSetAtom(submitReadOnlyAtom)

  const [error, submitAction] = useActionState(async (_: string | null, formData: FormData) => {
    try {
      const input = formData.get('input')?.toString() || ''
      const decoded = decodeNIP19(input)
      switch (decoded?.type) {
        case 'npub': {
          submitReadOnly(decoded.data)
          break
        }
        case 'nprofile': {
          submitReadOnly(decoded.data.pubkey)
          break
        }
        default: {
          if (input.includes('@')) {
            await submitNostrAddress(input)
            break
          } else if (input.length === 64) {
            submitReadOnly(input)
            break
          }
          throw new Error('Invalid Input')
        }
      }
      goBack()
      return null
    } catch (err) {
      const error = err as Error
      return error.message
    }
  }, null)

  const pasteClipboard = async () => {
    const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName })
    invariant(permissionStatus.state === 'granted', 'Clipboard permission rejected')
    return await window.navigator.clipboard.readText()
  }

  const handleClipboard = useCallback(async () => {
    try {
      const res = await pasteClipboard()
      if (ref.current) {
        ref.current.value = res
      }
      setInput(res)
    } catch (err) {
      const error = err as Error
      setSigninError(error.message)
    }
  }, [])

  return (
    <form action={submitAction} {...css.props(styles.root)}>
      <Stack horizontal={false} align='center' justify='flex-start' sx={styles.root}>
        <SignInHeader>
          <Text variant='headline'>Sign In with Public Key</Text>
        </SignInHeader>
        <Stack horizontal={false} gap={1} justify='center' sx={styles.content}>
          <SignInPreview />
          <Stack horizontal={false} gap={2} grow justify='center' sx={styles.center}>
            <TextField
              shrink
              name='input'
              ref={ref}
              onChange={(e) => setInput(e.target.value)}
              error={!!error || !!errorMsg}
              placeholder='npub, nprofile, nostr address (nip-05)'
              trailing={isMobile && <IconButton onClick={() => toggleCamera()} icon={<IconScan />} />}
            />
            {error && <Text>{error}</Text>}
            {errorMsg && <Text>{errorMsg}</Text>}
            <Button
              variant='outlined'
              sx={styles.button}
              onClick={handleClipboard}
              icon={<IconClipboardCopy size={18} strokeWidth='1.2' style={{ marginLeft: -20 }} />}>
              Paste
            </Button>
          </Stack>
          <Button type='submit' sx={styles.button} variant='filled'>
            Sign In
          </Button>
        </Stack>
      </Stack>
    </form>
  )
})

const styles = css.create({
  root: {
    height: '100%',
  },
  content: {
    width: '100%',
    height: '100%',
    padding: spacing.padding4,
  },
  center: {
    marginBottom: spacing.padding8,
  },
  loading: {
    width: 80,
    height: 80,
    marginInline: 'auto',
  },
  footer: {
    flex: 1,
  },
  button: {
    width: '100%',
    height: 50,
  },
})
