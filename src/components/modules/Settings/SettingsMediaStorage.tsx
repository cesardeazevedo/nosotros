import { UploadServersTable } from '@/components/elements/Upload/UploadServersTable'
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
  const nip96Suggestions = DEFAULT_NIP96_SERVERS
    .map((url) => `https://${url}`)
    .filter((url) => !nip96ServerList.data?.some((server) => server === url))

  const submit = (kind: Kind.BlossomServerList | Kind.NIP96ServerList) => (url: string) => {
    if (pubkey) {
      mutate([kind, url, pubkey])
    }
  }

  return (
    <Stack grow horizontal={false} sx={styles.container}>
      <Stack sx={styles.header}>
        <Text variant='title' size='lg'>
          Media Servers
        </Text>
      </Stack>
      <Divider />
      <Stack horizontal={false} gap={1} align='flex-start' sx={styles.root}>
        <UploadServersTable
          kind={Kind.BlossomServerList}
          servers={blossomServerList.data}
          onDelete={submit(Kind.BlossomServerList)}
          onSubmit={submit(Kind.BlossomServerList)}
        />
        <UploadServersTable
          kind={Kind.NIP96ServerList}
          servers={nip96ServerList.data}
          suggestions={nip96Suggestions}
          onDelete={submit(Kind.NIP96ServerList)}
          onSubmit={submit(Kind.NIP96ServerList)}
        />
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  container: {
    height: '100%',
  },
  root: {
    width: '100%',
    overflowY: 'auto',
    paddingBottom: spacing.padding3,
  },
  content: {
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
