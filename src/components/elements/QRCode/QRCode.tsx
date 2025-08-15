import { toggleQRCodeDialogAtom } from '@/atoms/dialog.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useNprofile } from '@/hooks/useEventUtils'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconX } from '@tabler/icons-react'
import { useSetAtom } from 'jotai'
import { QRCodeCanvas } from 'qrcode.react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { UserNIP05 } from '../User/UserNIP05'

type Props = {
  pubkey: string
}

export const QRCode = memo(function QRCode(props: Props) {
  const { pubkey } = props
  const nprofile = useNprofile(pubkey)
  const toggleQRCode = useSetAtom(toggleQRCodeDialogAtom)
  return (
    <html.div style={styles.root}>
      <IconButton sx={styles.close} onClick={() => toggleQRCode(false)} icon={<IconX />} />
      <Stack horizontal={false} gap={2} sx={styles.content}>
        <ContentProvider value={{ disablePopover: true, disableLink: true }}>
          <Stack horizontal={false} gap={2} align='center' justify='center'>
            <UserAvatar pubkey={pubkey} size='xl' sx={styles.avatar} />
            <Stack horizontal={false} align='center'>
              <UserName variant='title' size='lg' pubkey={pubkey}></UserName>
              <UserNIP05 pubkey={pubkey} />
            </Stack>
          </Stack>
        </ContentProvider>
        {nprofile ? (
          <html.div style={styles.qrcode}>
            <QRCodeCanvas value={nprofile} size={200} />
          </html.div>
        ) : (
          <Skeleton variant='rectangular' animation='wave' sx={styles.loading} />
        )}
        <Text size='lg' sx={styles.npub}>
          {nprofile}
        </Text>
        <Text variant='title' size='sm'>
          Follow me on Nostr
        </Text>
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
