import { IconGithub } from '@/components/elements/Icons/IconGithub'
import { Link } from '@/components/elements/Links/Link'
import { LinkBase } from '@/components/elements/Links/LinkBase'
import { UserName } from '@/components/elements/User/UserName'
import { UserRoot } from '@/components/elements/User/UserRoot'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useUserState } from '@/hooks/state/useUser'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconBoltFilled, IconBug } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { committerDate, sha } from '~build/git'
import { version } from '~build/package'

const PUBKEY = 'c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e'
const lastUpdated = DateTime.fromJSDate(new Date(committerDate)).toLocaleString()

export const SettingsAboutRoute = memo(function SettingsAboutRoute() {
  const user = useUserState(PUBKEY)
  const router = useRouter()
  return (
    <Stack grow horizontal={false}>
      <Stack sx={styles.header} gap={1}>
        <Text variant='title' size='lg'>
          About nosotros.app
        </Text>
      </Stack>
      <Divider />
      <Stack grow sx={styles.root} horizontal={false} gap={3}>
        <Stack horizontal={false} gap={2}>
          <Text variant='body' size='md'>
            Nosotros is a modern Nostr client for the web. It focuses on providing a clean, fast, and intuitive
            experience for interacting with the Nostr protocol.
          </Text>

          <Text variant='body' size='md'>
            nosotros.app is free and open source under MIT license.
          </Text>
        </Stack>

        <Stack horizontal={false} gap={1}>
          <Stack gap={0.5} sx={styles.center} justify='center'>
            <Text variant='label' size='sm' sx={styles.sectionTitle}>
              Built with ♥ by
            </Text>
            <UserName size='sm' pubkey={PUBKEY} sx={styles.sectionTitle} />
          </Stack>
          <Paper outlined sx={styles.userCard}>
            <UserRoot renderBanner pubkey={PUBKEY} />
          </Paper>
        </Stack>

        <Stack gap={0.5}>
          <Link href='https://github.com/cesardeazevedo/nosotros/issues'>
            <Button variant='filledTonal'>
              <IconBug size={18} strokeWidth='1.5' />
              Report Issue
            </Button>
          </Link>
          <LinkBase search={{ zap: user.nprofile }} state={{ from: router.latestLocation.pathname } as never}>
            <Button variant='filled'>
              <IconBoltFilled color={colors.violet4} size={18} strokeWidth='1.5' />
              Donate
            </Button>
          </LinkBase>
        </Stack>

        <Stack horizontal={false} gap={2}>
          <Text size='sm' sx={styles.versionText}>
            v{version} ({sha.slice(0, 8)})<br />
            Last update: {lastUpdated}
          </Text>
        </Stack>

        <Stack horizontal={false} gap={1} align='flex-start'>
          <Link href='https://github.com/cesardeazevedo/nosotros/issues'>
            <Stack gap={0.5} align='flex-start'>
              <IconBug size={18} strokeWidth='1.5' />
              Report Issue
            </Stack>
          </Link>
          <Link href='https://github.com/cesardeazevedo/nosotros' target='_blank' rel='noopeneer'>
            <Stack align='center'>
              <IconGithub />
              GitHub Repository
            </Stack>
          </Link>
        </Stack>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    padding: spacing.padding3,
  },
  header: {
    padding: spacing.padding2,
    height: 60,
  },
  sectionTitle: {
    color: palette.onSurfaceVariant,
    fontWeight: 600,
  },
  center: {
    textAlign: 'center',
  },
  versionText: {
    fontWeight: 500,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  linkText: {
    fontWeight: 500,
  },
  userCard: {
    overflow: 'hidden',
  },
})
