import { Avatar, Box, Button, IconButton, Skeleton, TextField, Typography } from '@mui/material'
import { IconClipboardCopy, IconScan } from '@tabler/icons-react'
import { useMobile } from 'hooks/useMobile'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useState } from 'react'
import { Control, Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useStore } from 'stores'
import UserName from '../User/UserName'

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
  const { users, auth } = useStore()
  const pubkey = useWatch({ name: 'pubkey', control: props.control })
  const user = pubkey ? users.getUserById(pubkey) : undefined

  useEffect(() => {
    if (!user && pubkey) {
      auth.fetchUser(pubkey)
    }
  }, [auth, pubkey, user])

  return (
    <Box sx={{ my: 1, mt: 2 }}>
      {!user && pubkey ? (
        <Skeleton variant='circular' sx={avatarStyle} />
      ) : (
        <Avatar src={user?.picture} sx={avatarStyle} />
      )}
      {user && <UserName user={user} variant='h6' />}
    </Box>
  )
})

const SignInForm = function SignInForm() {
  const { auth, dialogs } = useStore()
  const [permissionError, setPermissionError] = useState<string>()
  const isMobile = useMobile()
  const navigate = useNavigate()

  const form = useForm<FormValues>({
    mode: 'all',
    reValidateMode: 'onChange',
    resolver: (field) => {
      const pubkey = auth.decode(field.npub)
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

  const onSubmit = useCallback(
    (values: FormValues) => {
      auth.addAccount(values.pubkey)
      navigate('/')
    },
    [auth, navigate],
  )

  const handleClipboard = useCallback(async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName })

      if (permissionStatus.state === 'granted') {
        form.setValue('npub', await window.navigator.clipboard.readText(), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
        setPermissionError(undefined)
      } else {
        setPermissionError('Clipboard permission not granted')
      }
    } catch (error) {
      console.log(error)
    }
  }, [form])

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
                    <IconButton onClick={dialogs.openCamera}>
                      <IconScan />
                    </IconButton>
                  ),
                }}
              />
            )}
          />
          {permissionError && (
            <Typography color='error' sx={{ mb: 1 }}>
              {permissionError}
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
