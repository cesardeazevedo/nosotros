import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import type { Props as MenuListProps } from '@/components/ui/MenuList/MenuList'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { DEFAULT_NIP96_SERVERS } from '@/constants/relays'
import { useUserBlossomServers, useUserNIP96Servers } from '@/hooks/query/useQueryUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { spacing } from '@/themes/spacing.stylex'
import { css, html } from 'react-strict-dom'

type Props = {
  surface?: MenuListProps['surface']
  onSelect: (type: 'blossom' | 'nip96', url: string) => void
  onClose: () => void
}

export const UploadServersMenuList = (props: Props) => {
  const { surface = 'surfaceContainerLowest', onSelect, onClose } = props
  const pubkey = useCurrentPubkey()
  const nip96ServerList = useUserNIP96Servers(pubkey)
  const blossomServerList = useUserBlossomServers(pubkey)
  return (
    <MenuList surface={surface} sx={styles.root}>
      {blossomServerList.data && (
        <>
          <html.span style={styles.wrapper}>
            <Stack sx={styles.subheader}>
              <Text size='md'>Blossom Servers</Text>
            </Stack>
            {blossomServerList.data.map((url) => {
              let formatted
              try {
                formatted = new URL(url)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (error) {
                formatted = { host: url }
              }
              return (
                <MenuItem
                  key={url}
                  size='sm'
                  label={formatted.host}
                  onClick={() => {
                    onSelect('blossom', url)
                    close()
                  }}
                />
              )
            })}
          </html.span>
        </>
      )}
      <Divider />
      <html.span style={styles.wrapper}>
        <Stack sx={styles.subheader}>
          <Text size='md'>NIP-96</Text>
        </Stack>
        {nip96ServerList.data?.map((url) => (
          <MenuItem
            key={url}
            label={url.replace('https://', '')}
            size='sm'
            onClick={() => {
              onSelect('nip96', 'https://' + url)
              onClose()
            }}
          />
        ))}
        {DEFAULT_NIP96_SERVERS?.filter((server) => !nip96ServerList.data?.some((x) => x === 'https://' + server)).map(
          (url) => (
            <MenuItem
              key={url}
              label={url}
              size='sm'
              onClick={() => {
                onSelect('nip96', 'https://' + url)
                onClose()
              }}
            />
          ),
        )}
      </html.span>
    </MenuList>
  )
}

const styles = css.create({
  root: {
    paddingInline: 0,
  },
  wrapper: {
    paddingInline: spacing.padding1,
  },
  subheader: {
    marginLeft: spacing.padding2,
    marginBlock: spacing.padding1,
  },
})
