import { UploadServersTable } from '@/components/elements/Upload/UploadServersTable'
import { Chip } from '@/components/ui/Chip/Chip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import { DEFAULT_NIP96_SERVERS } from '@/constants/relays'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { useUserBlossomServers, useUserNIP96Servers } from '@/hooks/query/useQueryUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { publishMediaServer } from '@/nostr/publish/publishMediaServer'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconPlus } from '@tabler/icons-react'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const SettingsMediaStorage = memo(function SettingsMediaStorage() {
  const pubkey = useCurrentPubkey()
  const { mutate } = usePublishEventMutation<[Kind.BlossomServerList | Kind.NIP96ServerList, string, string]>({
    mutationFn:
      ({ signer }) =>
      ([kind, url, pubkey]) =>
        publishMediaServer(kind, url, pubkey, signer),
  })

  const nip96ServerList = useUserNIP96Servers(pubkey)
  const blossomServerList = useUserBlossomServers<string[]>(pubkey)

  const submit = (kind: Kind.BlossomServerList | Kind.NIP96ServerList) => (url: string) => {
    if (pubkey) {
      mutate([kind, url, pubkey])
    }
  }

  return (
    <Stack grow horizontal={false}>
      <Stack grow sx={styles.header}>
        <Text variant='title' size='lg'>
          Media Servers
        </Text>
      </Stack>
      <Divider />
      <Stack grow horizontal={false} gap={1} align='flex-start' sx={styles.content}>
        <UploadServersTable
          kind={Kind.BlossomServerList}
          servers={blossomServerList.data}
          onDelete={submit(Kind.BlossomServerList)}
          onSubmit={submit(Kind.BlossomServerList)}
        />
        <br />
        <UploadServersTable
          kind={Kind.NIP96ServerList}
          servers={nip96ServerList.data}
          onDelete={submit(Kind.NIP96ServerList)}
          onSubmit={submit(Kind.NIP96ServerList)}
        />
        <Stack horizontal={false} gap={2} sx={styles.suggestions}>
          <Text variant='title' size='sm' sx={[]}>
            NIP96 Servers Suggestions
          </Text>
          <Stack wrap gap={1}>
            {DEFAULT_NIP96_SERVERS.filter(
              (x) => !nip96ServerList.data?.some((server) => server === 'https://' + x),
            ).map((url) => (
              <Chip
                variant='suggestion'
                icon={<IconPlus size={18} strokeWidth='1.5' />}
                label={url}
                onClick={() => submit(Kind.NIP96ServerList)('https://' + url)}
              />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    alignItems: 'flex-start',
  },
  header: {
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding4,
  },
  description: {
    paddingTop: spacing.padding2,
    paddingInline: spacing.padding2,
    color: palette.onSurfaceVariant,
  },
  content: {
    width: '100%',
  },
  section: {
    padding: spacing.padding1,
  },
  search: {
    height: 40,
  },
  paper: {
    width: 350,
    padding: spacing.padding1,
  },
  row: {
    height: 50,
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  suggestions: {
    padding: spacing.padding2,
  },
  cell$first: {
    paddingLeft: spacing.padding2,
  },
  cell$last: {
    paddingRight: spacing.padding2,
  },
  footer: {
    paddingInline: spacing.padding2,
  },
})
