import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { useGoBack } from '@/hooks/useNavigations'
import { useRootContext } from '@/hooks/useRootStore'
import { subscribeUser } from '@/nostr/subscriptions/subscribeUser'
import { signinStore } from '@/stores/signin/signin.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconClipboardCopy, IconScan } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { useActionState, useCallback, useRef } from 'react'
import { css } from 'react-strict-dom'
import { debounceTime, filter, switchMap } from 'rxjs'
import { dialogStore } from 'stores/ui/dialogs.store'
import { decodeNIP19 } from 'utils/nip19'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { SignInHeader } from './SignInHeader'

const SignInPreview = observer(function UserPreview() {
  const input = signinStore.inputPubkey
  const context = useRootContext()

  const input$ = useObservable(pluckFirst, [input])
  const sub = useObservable(() => {
    return input$.pipe(
      filter((x) => !!x),
      debounceTime(250),
      switchMap((value) => subscribeUser(value, context)),
    )
  })
  const user = useObservableState(sub)

  return (
    user && (
      <ContentProvider value={{ disableLink: true, disablePopover: true }}>
        <Stack horizontal={false} gap={2} justify='flex-end' align='center'>
          {!user ? <Skeleton variant='circular' sx={styles.loading} /> : <UserAvatar pubkey={user.pubkey} size='lg' />}
          {user && <UserName variant='title' size='lg' pubkey={user.pubkey} />}
        </Stack>
      </ContentProvider>
    )
  )
})

export const SignInReadOnly = observer(function SignInForm() {
  const isMobile = useMobile()
  const goBack = useGoBack()
  const ref = useRef<HTMLInputElement>(null)

  const [error, submitAction] = useActionState(async (_: string | null, formData: FormData) => {
    try {
      const input = formData.get('input')?.toString() || ''
      const decoded = decodeNIP19(input)
      switch (decoded?.type) {
        case 'npub': {
          signinStore.submitReadonly(decoded.data)
          break
        }
        case 'nprofile': {
          signinStore.submitReadonly(decoded.data.pubkey)
          break
        }
        default: {
          if (input.includes('@')) {
            await signinStore.submitNostrAddress(input)
            break
          } else if (input.length === 64) {
            signinStore.submitReadonly(input)
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

  const handleClipboard = useCallback(async () => {
    try {
      const res = await signinStore.pasteClipboard()
      if (ref.current) {
        ref.current.value = res
      }
      signinStore.setReadonlyInput(res)
    } catch (err) {
      const error = err as Error
      signinStore.setError(error.message)
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
              onChange={(e) => signinStore.setReadonlyInput(e.target.value)}
              error={!!error || !!signinStore.error}
              placeholder='npub, nprofile, nostr address (nip-05)'
              trailing={isMobile && <IconButton onClick={() => dialogStore.toggleCamera()} icon={<IconScan />} />}
            />
            {error && <Text>{error}</Text>}
            {signinStore.error && <Text>{signinStore.error}</Text>}
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
