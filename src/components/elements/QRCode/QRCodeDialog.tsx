import { Box, Button, IconButton, Skeleton, Typography } from '@mui/material'
import { IconCameraFilled, IconX } from '@tabler/icons-react'
import { useStore } from 'hooks/useStore'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { QRCodeCanvas } from 'qrcode.react'
import { useMemo } from 'react'
import { encodeSafe } from 'utils/nip19'
import UserAvatar from '../User/UserAvatar'
import UserName from '../User/UserName'

const QRCodeDialog = observer(function QRCodeDialog() {
  const store = useStore()
  const { pubkey, currentUser: user } = store.auth
  const npub = useMemo(() => encodeSafe(() => nip19.npubEncode(pubkey || '')), [pubkey])
  return (
    <>
      <Box sx={{ position: 'absolute', left: 20, top: 20, zIndex: 10000 }}>
        <IconButton sx={{ color: 'inherit' }} onClick={store.dialogs.closeQRCode}>
          <IconX size={28} />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          py: 6,
          position: 'relative',
        }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 10, p: 0.5 }}>
            <UserAvatar user={user} size={100} />
          </Box>
          <UserName user={user} variant='h4' sx={{ mt: 1 }}>
            <Typography variant='subtitle1' sx={{ textAlign: 'center' }}>
              @{user?.displayName}
            </Typography>
          </UserName>
        </Box>
        <Box sx={{ p: 1, mt: 2 }}>
          {npub ? (
            <QRCodeCanvas value={npub} size={200} />
          ) : (
            <Skeleton variant='rectangular' animation='wave' width={200} height={200} sx={{ borderRadius: 1 }} />
          )}
        </Box>
        <Typography sx={{ maxWidth: '70%', wordBreak: 'break-all', textAlign: 'center' }}>{npub}</Typography>
        <Typography variant='h5' sx={{ my: 3 }}>
          Follow me on Nostr
        </Typography>
        <Button size='large' variant='contained' sx={{ px: 5 }} onClick={store.dialogs.openCamera}>
          <IconCameraFilled strokeWidth='1.2' size={20} style={{ marginRight: 8 }} />
          Scan QRCode
        </Button>
      </Box>
    </>
  )
})

export default QRCodeDialog
