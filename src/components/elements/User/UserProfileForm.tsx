import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { filesAtom, resetFileUploadAtom, selectFilesForUploadAtom, uploadFilesAtom } from '@/atoms/upload.atoms'
import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TextField } from '@/components/ui/TextField/TextField'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import type { UserSchema } from '@/hooks/parsers/parseUser'
import { useCurrentUser } from '@/hooks/useAuth'
import { useMobile } from '@/hooks/useMobile'
import { publishMetadata } from '@/nostr/publish/publishMetadata'
import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { compactObject } from '@/utils/utils'
import { IconEdit, IconTrashX, IconUpload } from '@tabler/icons-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import { useActionState, useState } from 'react'
import { css, html } from 'react-strict-dom'
import invariant from 'tiny-invariant'
import { UploadServersMenuList } from '../Upload/UploadServersMenuList'

const UserProfileBanner = (props: { defaultValue?: string; onUploading?: (uploading: boolean) => void }) => {
  const [src, setSrc] = useState(props.defaultValue)
  const [error, setError] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const resetFiles = useSetAtom(resetFileUploadAtom)
  const selectFiles = useSetAtom(selectFilesForUploadAtom)
  const uploadFiles = useSetAtom(uploadFilesAtom)
  const files = useAtomValue(filesAtom)
  const isMobile = useMobile()
  const file = files.length > 0 ? files[0] : undefined
  const isUploading = file?.uploading || false
  return (
    <html.div style={styles.banner}>
      {!error && !!src && (
        <html.img src={file ? file.src : src} onError={() => setError(true)} style={styles.banner$img} />
      )}
      <Stack
        gap={1}
        align='center'
        justify='center'
        sx={[styles.banner$backdrop, (showInput || isUploading || isMobile) && styles.banner$editing]}>
        {isUploading && <CircularProgress />}
        {!showInput && !isUploading && (
          <>
            {props.defaultValue && (
              <Stack sx={styles.banner$delete}>
                <Tooltip enterDelay={0} text='Remove banner'>
                  <IconButton
                    size='sm'
                    variant='outlined'
                    sx={[styles.banner$delete$icon, styles.outlined]}
                    onClick={() => {
                      setSrc('')
                      setError(false)
                    }}>
                    <IconTrashX size={18} strokeWidth='1.5' />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
            <Button variant='outlined' sx={styles.outlined} onClick={() => setShowInput(true)}>
              <IconEdit size={18} />
              Set Banner URL
            </Button>
            <TooltipRich
              cursor='dot'
              openEvents={{ click: true, hover: false }}
              content={({ close }) => (
                <UploadServersMenuList
                  surface='surfaceContainerLow'
                  onSelect={(type, url) => {
                    resetFiles()
                    selectFiles({
                      multiple: false,
                      defaultUploadType: type,
                      defaultUploadUrl: url,
                      onSelect: async () => {
                        try {
                          close()
                          props.onUploading?.(true)
                          await uploadFiles()
                        } catch {
                          resetFiles()
                          close()
                        }
                        props.onUploading?.(false)
                      },
                    })
                  }}
                  onClose={close}
                />
              )}>
              <Button variant='filled' sx={styles.elevation}>
                <IconUpload size={18} />
                Upload
              </Button>
            </TooltipRich>
          </>
        )}
        <Stack
          horizontal={false}
          gap={2}
          align='center'
          justify='center'
          sx={[styles.banner$edit, !showInput && styles.hidden]}>
          <TextField
            shrink
            fullWidth
            name='banner'
            placeholder='https://example.com/banner.jpg'
            value={file ? file.src : src}
            label='Banner Image URL'
            onChange={(e) => {
              setError(false)
              setSrc(e.target.value)
            }}
          />
          <Stack gap={0.5} align='center'>
            <Button
              variant='outlined'
              sx={styles.outlined}
              onClick={() => {
                setShowInput(false)
                setSrc(props.defaultValue)
              }}>
              Cancel
            </Button>
            <Button variant='filled' sx={styles.elevation} onClick={() => setShowInput(false)}>
              Save
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </html.div>
  )
}

const UserProfileAvatar = (props: { defaultValue?: string; onUploading?: (uploading: boolean) => void }) => {
  const [src, setSrc] = useState(props.defaultValue)
  const [error, setError] = useState(false)
  const [view, setView] = useState<'idle' | 'selectUploadServer' | 'editingUrl'>('idle')
  const files = useAtomValue(filesAtom)
  const resetFiles = useSetAtom(resetFileUploadAtom)
  const selectFiles = useSetAtom(selectFilesForUploadAtom)
  const uploadFiles = useSetAtom(uploadFilesAtom)
  const isMobile = useMobile()
  const file = files.length > 0 ? files[0] : undefined
  const isUploading = file?.uploading || false
  return (
    <Stack horizontal={false} align='flex-start' justify='flex-start' sx={styles.avatarRow} gap={4}>
      <TooltipRich
        cursor='dot'
        placement='bottom-start'
        openEvents={{ click: true, hover: false }}
        onClose={() => setView(view === 'selectUploadServer' ? 'idle' : view)}
        content={({ close }) => (
          <>
            {view === 'selectUploadServer' ? (
              <UploadServersMenuList
                onClose={() => setView('idle')}
                onSelect={(type, url) => {
                  resetFiles()
                  selectFiles({
                    multiple: false,
                    defaultUploadType: type,
                    defaultUploadUrl: url,
                    onSelect: async () => {
                      try {
                        close()
                        props.onUploading?.(true)
                        await uploadFiles()
                        setView('editingUrl')
                      } catch {
                        resetFiles()
                        setView('idle')
                        close()
                      }
                      props.onUploading?.(false)
                    },
                  })
                }}
              />
            ) : (
              <MenuList surface='surfaceContainerLow'>
                <>
                  <MenuItem
                    size='sm'
                    leadingIcon={<IconUpload size={18} />}
                    onClick={() => setView('selectUploadServer')}
                    label='Upload'
                  />
                  <MenuItem
                    interactive
                    size='sm'
                    leadingIcon={<IconEdit size={18} />}
                    label='Set Avatar URL'
                    onClick={() => {
                      close()
                      setView('editingUrl')
                    }}
                  />
                </>
              </MenuList>
            )}
          </>
        )}>
        <Stack sx={styles.avatar$wrapper}>
          <Stack
            align='center'
            justify='center'
            sx={[styles.banner$backdrop, styles.avatar$backdrop, (isUploading || isMobile) && styles.avatar$uploading]}>
            {isUploading ? <CircularProgress size='sm' /> : <IconUpload stroke='white' size={28} strokeWidth='1.2' />}
          </Stack>
          {src && !error ? (
            <Avatar
              src={files.length > 0 ? files[0].src : src}
              size='xl'
              sx={styles.avatar}
              onError={() => setError(true)}
            />
          ) : (
            <Avatar src='/user.jpg' size='xl' sx={styles.avatar} />
          )}
        </Stack>
      </TooltipRich>
      <TextField
        shrink
        fullWidth
        name='picture'
        sx={view !== 'editingUrl' && styles.hidden}
        placeholder='https://example.com/avatar.png'
        value={file ? file.src : src}
        onChange={(e) => {
          setSrc(e.target.value)
          setError(false)
        }}
        label='Avatar Image URL'
      />
    </Stack>
  )
}

type Props = {
  onClose?: () => void
}

export const UserProfileForm = (props: Props) => {
  const user = useCurrentUser()
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const meta = user.metadata
  const initialValues: UserSchema = {
    display_name: meta?.display_name,
    about: meta?.about,
    banner: meta?.banner,
    picture: meta?.picture || '',
    pronouns: meta?.pronouns || '',
    website: meta?.website || '',
    nip05: meta?.nip05 || '',
    lud06: meta?.lud06 || '',
    lud16: meta?.lud16 || '',
  }

  const [isAvatarUploading, setAvatarUploading] = useState(false)
  const [isBannerUploading, setBannerUploading] = useState(false)

  const { mutateAsync } = usePublishEventMutation<[pubkey: string, UserSchema]>({
    mutationFn:
      ({ signer }) =>
      ([pubkey, metadata]: [string, UserSchema]) =>
        publishMetadata(pubkey, metadata, { signer }),
  })

  const submitAction = async (_: unknown, formData: FormData) => {
    const values: UserSchema = {
      display_name: formData.get('display_name')?.toString() || '',
      about: formData.get('about')?.toString(),
      banner: formData.get('banner')?.toString(),
      picture: formData.get('picture')?.toString(),
      pronouns: formData.get('pronouns')?.toString(),
      website: formData.get('website')?.toString(),
      nip05: formData.get('nip05')?.toString(),
      lud06: formData.get('lud06')?.toString(),
      lud16: formData.get('lud16')?.toString(),
    }
    try {
      invariant(user.event, "Couldn't find user kind 0 event")
      const content = compactObject({ ...JSON.parse(user.event?.content), ...values })
      await mutateAsync([user.event.pubkey, content])
      props.onClose?.()
    } catch (error) {
      const msg = error as Error
      enqueueToast({ component: msg.toString(), duration: 4000 })
    }
    return null
  }

  const [, formAction, isPending] = useActionState(submitAction, null)

  return (
    <form action={formAction}>
      <Stack sx={styles.root} horizontal={false}>
        <Stack justify='space-between' sx={styles.header}>
          <Button onClick={props.onClose}>Cancel</Button>
          <Text variant='title' size='lg'>
            Edit Profile
          </Text>
          <Button
            type='submit'
            disabled={isPending || isAvatarUploading || isBannerUploading}
            variant='filled'
            onClick={() => {}}>
            {isPending ? 'Submitting' : 'Submit'}
          </Button>
        </Stack>
        <Divider />
        <ScopeProvider atoms={[filesAtom]}>
          <UserProfileBanner defaultValue={initialValues.banner} onUploading={setBannerUploading} />
        </ScopeProvider>
        <Stack sx={styles.content} horizontal={false} gap={2}>
          <ScopeProvider atoms={[filesAtom]}>
            <UserProfileAvatar defaultValue={initialValues.picture} onUploading={setAvatarUploading} />
          </ScopeProvider>
          <Stack gap={1}>
            <TextField
              name='display_name'
              fullWidth
              shrink
              label='Name'
              placeholder='Name'
              defaultValue={initialValues.display_name}
            />
            <TextField
              name='pronouns'
              shrink
              label='Pronouns'
              placeholder='they/them'
              defaultValue={initialValues.pronouns}
            />
          </Stack>
          <TextField
            multiline
            name='about'
            maxLength={20}
            fullWidth
            shrink
            label='About'
            rows={3}
            defaultValue={initialValues.about}
          />
          <TextField
            name='website'
            fullWidth
            shrink
            label='Website URL'
            placeholder='https://'
            defaultValue={initialValues.website}
          />
          <TextField
            name='nip05'
            fullWidth
            shrink
            label='Nostr Address (NIP-05)'
            placeholder='name@relay.domain'
            defaultValue={initialValues.nip05}
          />
          <TextField
            name='lud06'
            fullWidth
            shrink
            label='LN Address'
            placeholder='you@ln.example'
            defaultValue={initialValues.lud06}
          />
          <TextField name='lud16' fullWidth shrink label='LN URL' placeholder='' defaultValue={initialValues.lud16} />
        </Stack>
      </Stack>
    </form>
  )
}

const styles = css.create({
  root: {},
  header: {
    padding: spacing.padding2,
  },
  content: {
    padding: spacing.padding2,
  },
  banner: {
    width: '100%',
    height: 240,
    position: 'relative',
    padding: spacing.padding4,
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner$backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: 5,
    transition: 'all 0.1s ease',
    [palette.onSurface]: 'white',
    [palette.primary]: 'white',
    [palette.onPrimary]: 'white',
    color: 'white',
    opacity: 0,
    ':hover': {
      opacity: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.80)',
    },
  },
  banner$editing: {
    opacity: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.80)',
  },
  banner$options: {
    top: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 8,
  },
  banner$img: {
    top: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  banner$edit: {
    zIndex: 5,
    width: '80%',
    marginTop: spacing.margin2,
  },
  banner$delete: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  banner$delete$icon: {
    color: 'inherit',
    ':hover': {
      color: palette.error,
      borderColor: palette.error,
    },
  },
  avatar: {
    border: '4px solid',
    borderColor: palette.surfaceContainerLowest,
    cursor: 'pointer',
  },
  avatar$uploading: {
    opacity: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.80)',
  },
  avatar$backdrop: {
    cursor: 'pointer',
  },
  avatar$wrapper: {
    position: 'relative',
    marginTop: -60,
    width: 90,
    height: 90,
    borderRadius: shape.full,
    overflow: 'hidden',
    transition: 'all 0.1s ease',
    transform: 'scale(1)',
    ':active': {
      transform: 'scale(0.94)',
    },
  },
  avatarRow: {
    zIndex: 10,
    marginBottom: spacing.margin2,
  },
  actions: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding2,
  },
  outlined: {
    color: 'white',
    backgroundColor: 'transparent',
  },
  elevation: {
    boxShadow: elevation.shadows4,
    backgroundColor: 'white',
    color: 'black',
  },
  submit: {
    height: 48,
  },
  hidden: {
    display: 'none',
  },
})
