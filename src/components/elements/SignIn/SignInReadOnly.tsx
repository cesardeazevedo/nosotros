import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { useGoBack } from '@/hooks/useNavigations'
import { useObservableNostrContext } from '@/stores/context/nostr.context.hooks'
import { signinStore } from '@/stores/signin/signin.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconClipboardCopy, IconScan } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { pluckFirst, useObservable, useObservableState } from 'observable-hooks'
import { useCallback } from 'react'
import { Controller, useForm, useWatch, type Control } from 'react-hook-form'
import { css } from 'react-strict-dom'
import { debounceTime, filter, switchMap } from 'rxjs'
import { dialogStore } from 'stores/ui/dialogs.store'
import { decodeNIP19 } from 'utils/nip19'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { SignInHeader } from './SignInHeader'

type FormValues = {
  input: string
  pubkey: string
}

const UserPreview = observer(function UserPreview(props: { control: Control<FormValues> }) {
  const input = useWatch({ name: 'pubkey', control: props.control })

  const input$ = useObservable(pluckFirst, [input])
  const sub = useObservableNostrContext((context) => {
    return input$.pipe(
      filter((x) => !!x),
      debounceTime(250),
      switchMap((value) => context.client.users.subscribe(value)),
    )
  })
  const user = useObservableState(sub)

  if (!user) {
    return
  }
  return (
    <ContentProvider value={{ disableLink: true, disablePopover: true }}>
      <Stack horizontal={false} gap={2} justify='flex-end' align='center'>
        {!user ? <Skeleton variant='circular' sx={styles.loading} /> : <UserAvatar pubkey={user.pubkey} size='lg' />}
        {user && <UserName variant='title' size='lg' pubkey={user.pubkey} />}
      </Stack>
    </ContentProvider>
  )
})

export const SignInReadOnly = observer(function SignInForm() {
  const isMobile = useMobile()
  const goBack = useGoBack()

  const form = useForm<FormValues>({
    mode: 'all',
    reValidateMode: 'onChange',
    resolver: (field) => {
      if (field.input.startsWith('npub') || field.input.startsWith('nprofile')) {
        const decoded = decodeNIP19(field.input)
        switch (decoded?.type) {
          case 'npub': {
            form.setValue('pubkey', decoded.data)
            break
          }
          case 'nprofile': {
            form.setValue('pubkey', decoded.data.pubkey)
            break
          }
          default: {
            return { values: {}, errors: { input: { type: 'value', message: 'Invalid pubkey' } } }
          }
        }
      } else if (!field.input.includes('@')) {
        const pubkey = field.input
        form.setValue('pubkey', pubkey)
      }
      return { values: { input: field.input, pubkey: field.pubkey }, errors: {} }
    },
    defaultValues: {
      input: '',
      pubkey: '',
    },
  })

  const onSubmit = useCallback(async (values: FormValues) => {
    if (values.input.includes('@')) {
      const pubkey = await signinStore.submitNostrAddress(values.input)
      if (!pubkey) {
        form.setError('input', { message: 'name not found' })
      }
    } else {
      signinStore.submitReadonly(values.pubkey)
    }
    goBack()
  }, [])

  const handleClipboard = useCallback(async () => {
    const res = await signinStore.pasteClipboard()
    if (res) {
      return form.setValue('input', res, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
    const error = {
      type: 'value',
      message: 'Permission not granted',
    }
    form.setError('input', error, { shouldFocus: true })
  }, [])

  return (
    <Stack horizontal={false} align='center' justify='flex-start' sx={styles.root}>
      <SignInHeader>
        <Text variant='headline'>Sign In with Public Key</Text>
      </SignInHeader>
      {/* <Text variant='headline'>Sign In with Public Key</Text> */}
      <Stack horizontal={false} gap={1} justify='center' sx={styles.content}>
        <UserPreview control={form.control} />
        <Stack horizontal={false} gap={2} grow justify='center' sx={styles.center}>
          <Controller
            name='input'
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                shrink
                error={Boolean(form.formState.errors.input) && form.formState.isSubmitted}
                placeholder='npub, nprofile, nostr address (nip-05)'
                trailing={isMobile && <IconButton onClick={dialogStore.openCamera} icon={<IconScan />} />}
              />
            )}
          />
          {form.formState.isSubmitted && <Text>{form.formState.errors.input?.message}</Text>}
          <Button
            variant='outlined'
            sx={styles.button}
            onClick={handleClipboard}
            icon={<IconClipboardCopy size={18} strokeWidth='1.2' style={{ marginLeft: -20 }} />}>
            Paste
          </Button>
        </Stack>
        {/* {clipboardError && <Text>{clipboardError}</Text>} */}
        <Button sx={styles.button} variant='filled' onClick={() => form.handleSubmit(onSubmit)()}>
          Sign In
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
