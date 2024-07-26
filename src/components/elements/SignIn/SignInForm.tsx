import { Box, Button, IconButton, Skeleton, TextField, Typography } from '@mui/material'
import { IconClipboardCopy, IconScan } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect } from 'react'
import { Controller, useForm, useWatch, type Control } from 'react-hook-form'
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

const avatarStyle = {
  width: 80,
  height: 80,
  mx: 'auto',
  my: 1,
}

const UserPreview = observer(function UserPreview(props: { control: Control<FormValues> }) {
  const pubkey = useWatch({ name: 'pubkey', control: props.control })
  const user = userStore.get(pubkey)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 1 }}>
      {!user && pubkey ? <Skeleton variant='circular' sx={avatarStyle} /> : <UserAvatar user={user} size={80} />}
      {user && <UserName disableLink disablePopover user={user} variant='h6' sx={{ py: 1 }} />}
    </Box>
  )
})

const SignInForm = function SignInForm() {
  const onboardMachine = OnboardMachineContext.useActorRef()
  const pubkey = OnboardMachineContext.useSelector((x) => x.context.pubkey)
  const clipboardError = OnboardMachineContext.useSelector((x) => x.context.clipboardError)
  const isMobile = useMobile()

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
  }, [])

  const handleClipboard = useCallback(async () => {
    onboardMachine.send({ type: 'paste' })
  }, [onboardMachine])

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
        <Box>
          <UserPreview control={form.control} />
          <Typography variant='h5' sx={{ mb: 4 }}>
            Sign In with Public Key
          </Typography>
          <Controller
            name='npub'
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                error={Boolean(form.formState.errors.npub) && form.formState.isSubmitted}
                helperText={form.formState.isSubmitted ? form.formState.errors.npub?.message : ''}
                fullWidth
                label='Public key (npub)'
                placeholder='npub...'
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: isMobile && (
                    <IconButton onClick={dialogStore.openCamera}>
                      <IconScan />
                    </IconButton>
                  ),
                }}
              />
            )}
          />
          {clipboardError && (
            <Typography color='error' sx={{ mb: 1 }}>
              {clipboardError}
            </Typography>
          )}
          <Button
            fullWidth
            size='large'
            color='primary'
            variant='text'
            sx={{ height: 50, backgroundColor: 'action.hover' }}
            onClick={handleClipboard}>
            <IconClipboardCopy />
            Paste from clipboard
          </Button>
        </Box>
      </Box>
      <Box sx={{ mt: 2, borderRadius: 1, p: 0 }}>
        <Button
          fullWidth
          variant='contained'
          color='info'
          size='large'
          onClick={() => form.handleSubmit(onSubmit)()}
          sx={{ mt: 0, height: 50 }}>
          Sign In
        </Button>
      </Box>
    </>
  )
}

export default SignInForm
