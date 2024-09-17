import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { useGoBack } from '@/hooks/useNavigations'
import { appState } from '@/stores/app.state'
import { spacing } from '@/themes/spacing.stylex'
import { IconClipboardCopy, IconScan } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import { useCallback, useEffect } from 'react'
import { Controller, useForm, useWatch, type Control } from 'react-hook-form'
import { css } from 'react-strict-dom'
import { userStore } from 'stores/nostr/users.store'
import { authStore } from 'stores/ui/auth.store'
import { dialogStore } from 'stores/ui/dialogs.store'
import { decodeNIP19, type Npub } from 'utils/nip19'
import UserAvatar from '../User/UserAvatar'
import UserName from '../User/UserName'
import { OnboardMachineContext } from './SignInContext'

type FormValues = {
  npub: string
  pubkey: string
}

const UserPreview = observer(function UserPreview(props: { control: Control<FormValues> }) {
  const pubkey = useWatch({ name: 'pubkey', control: props.control })

  const sub = useObservable(() => appState.client.users.subscribe([pubkey]))
  useSubscription(sub)

  const user = userStore.get(pubkey)

  return (
    pubkey && (
      <Stack horizontal={false} gap={1} justify='center' align='center'>
        {!user ? <Skeleton variant='circular' sx={styles.loading} /> : <UserAvatar user={user} size='lg' />}
        {user && <UserName disableLink disablePopover variant='title' size='lg' user={user} />}
      </Stack>
    )
  )
})

const SignInForm = function SignInForm() {
  const onboardMachine = OnboardMachineContext.useActorRef()
  const pubkey = OnboardMachineContext.useSelector((x) => x.context.pubkey)
  const clipboardError = OnboardMachineContext.useSelector((x) => x.context.clipboardError)
  const isMobile = useMobile()
  const goBack = useGoBack()

  const form = useForm<FormValues>({
    mode: 'all',
    reValidateMode: 'onChange',
    resolver: (field) => {
      const pubkey = decodeNIP19(field.npub as Npub)?.data
      if (!pubkey) {
        return { values: {}, errors: { npub: { type: 'value', message: 'npub invalid' } } }
      }
      form.setValue('pubkey', pubkey)
      return { values: { npub: field.npub, pubkey }, errors: {} }
    },
    defaultValues: {
      npub: '',
      pubkey: '',
    },
  })

  useEffect(() => {
    if (pubkey) {
      form.setValue('npub', pubkey, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }
  }, [form, pubkey])

  const onSubmit = useCallback((values: FormValues) => {
    authStore.loginWithPubkey(values.pubkey)
    goBack()
  }, [])

  const handleClipboard = useCallback(async () => {
    onboardMachine.send({ type: 'paste' })
  }, [onboardMachine])

  return (
    <Stack horizontal={false} gap={2} align='stretch' justify='flex-end' sx={styles.content}>
      <UserPreview control={form.control} />
      <Text variant='headline'>Sign In with Public Key</Text>
      <Stack horizontal={false} gap={1}>
        <Controller
          name='npub'
          control={form.control}
          render={({ field }) => (
            <TextField
              {...field}
              error={Boolean(form.formState.errors.npub) && form.formState.isSubmitted}
              label='Public key (npub)'
              placeholder='npub...'
              trailing={isMobile && <IconButton onClick={dialogStore.openCamera} icon={<IconScan />} />}
            />
          )}
        />
        {form.formState.isSubmitted && <Text>{form.formState.errors.npub?.message}</Text>}
        <Button variant='outlined' sx={styles.button} onClick={handleClipboard} icon={<IconClipboardCopy size={20} />}>
          Paste
        </Button>
        {clipboardError && <Text>{clipboardError}</Text>}
      </Stack>
      <Stack align='flex-end' sx={styles.footer}>
        <Button sx={styles.button} variant='filled' onClick={() => form.handleSubmit(onSubmit)()}>
          Sign In
        </Button>
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  loading: {
    width: 80,
    height: 80,
    marginInline: 'auto',
    marginBlock: spacing.margin1,
  },
  content: {
    flex: 0.8,
    paddingTop: spacing.padding5,
    paddingBottom: spacing.padding9,
  },
  footer: {
    flex: 1,
  },
  button: {
    width: '100%',
    height: 50,
  },
})

export default SignInForm
