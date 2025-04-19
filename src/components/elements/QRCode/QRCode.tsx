import { ContentProvider } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentUser } from '@/hooks/useRootStore'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconX } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { QRCodeCanvas } from 'qrcode.react'
import { useMemo } from 'react'
import { css, html } from 'react-strict-dom'
import { dialogStore } from 'stores/ui/dialogs.store'
import { encodeSafe } from 'utils/nip19'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { UserNIP05 } from '../User/UserNIP05'

export const QRCode = observer(function QRCode() {
  const user = useCurrentUser()
  const npub = useMemo(() => encodeSafe(() => nip19.npubEncode(user?.pubkey || '')), [user])
  return (
    <html.div style={styles.root}>
      <IconButton sx={styles.close} onClick={() => dialogStore.toggleQRCode(false)} icon={<IconX />} />
      <Stack horizontal={false} gap={2} sx={styles.content}>
        {user && (
          <ContentProvider value={{ disablePopover: true, disableLink: true }}>
            <Stack horizontal={false} gap={2} align='center' justify='center'>
              <UserAvatar pubkey={user.pubkey} size='xl' sx={styles.avatar} />
              <Stack horizontal={false} align='center'>
                <UserName variant='title' size='lg' pubkey={user?.pubkey}></UserName>
                <UserNIP05 pubkey={user?.pubkey} />
              </Stack>
            </Stack>
          </ContentProvider>
        )}
        {npub ? (
          <html.div style={styles.qrcode}>
            <QRCodeCanvas value={npub} size={200} />
          </html.div>
        ) : (
          <Skeleton variant='rectangular' animation='wave' sx={styles.loading} />
        )}
        <Text size='lg' sx={styles.npub}>
          {npub}
        </Text>
        <Text>Follow me on Nostr</Text>
        {/* <Button */}
        {/*   variant='filled' */}
        {/*   onClick={dialogStore.openCamera} */}
        {/*   icon={<IconCameraFilled strokeWidth='1.2' size={20} style={{ marginRight: 8 }} />}> */}
        {/*   Scan QRCode */}
        {/* </Button> */}
      </Stack>
    </html.div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    paddingBottom: spacing.padding8,
  },
  qrcode: {
    backgroundColor: 'white',
    padding: spacing.padding2,
    borderRadius: shape.md,
  },
  avatar: {
    boxShadow: `0px 0px 0px 4px white`,
  },
  button: {},
  close: {
    position: 'absolute',
    top: spacing.margin1,
    right: spacing.margin1,
    zIndex: 1000,
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
    maxWidth: '51%',
    wordBreak: 'break-all',
    fontFamily: 'monospace',
  },
})
