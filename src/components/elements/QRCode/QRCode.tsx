import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconCameraFilled, IconX } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { QRCodeCanvas } from 'qrcode.react'
import { useMemo } from 'react'
import { css, html } from 'react-strict-dom'
import { authStore } from 'stores/ui/auth.store'
import { dialogStore } from 'stores/ui/dialogs.store'
import { encodeSafe } from 'utils/nip19'
import UserAvatar from '../User/UserAvatar'
import UserName from '../User/UserName'

const QRCode = observer(function QRCodeDialog() {
  const { pubkey, currentUser: user } = authStore
  const npub = useMemo(() => encodeSafe(() => nip19.npubEncode(pubkey || '')), [pubkey])
  return (
    <html.div style={styles.root}>
      <IconButton sx={styles.close} onClick={dialogStore.closeQRCode} icon={<IconX />} />
      <Stack horizontal={false} gap={2} sx={styles.content}>
        <Stack horizontal={false} gap={2} align='center' justify='center'>
          <UserAvatar user={user} size='lg' />
          <UserName user={user}>
            <Text size='lg'>@{user?.displayName}</Text>
          </UserName>
        </Stack>
        {npub ? (
          <QRCodeCanvas value={npub} size={200} />
        ) : (
          <Skeleton variant='rectangular' animation='wave' sx={styles.loading} />
        )}
        <Text size='lg' sx={styles.npub}>
          {npub}
        </Text>
        <Text>Follow me on Nostr</Text>
        <Button
          variant='filled'
          onClick={dialogStore.openCamera}
          icon={<IconCameraFilled strokeWidth='1.2' size={20} style={{ marginRight: 8 }} />}>
          Scan QRCode
        </Button>
      </Stack>
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
  },
  button: {},
  close: {
    position: 'absolute',
    top: 0,
    right: -24,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingTop: spacing.padding9,
    position: 'relative',
  },
  loading: {
    width: 200,
    height: 200,
  },
  npub: {
    maxWidth: '70%',
    wordBreak: 'break-all',
    textAlign: 'center',
  },
})

export default QRCode
