import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconBug } from '@tabler/icons-react'
import { DateTime } from 'luxon'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { committerDate, sha } from '~build/git'
import { version } from '~build/package'
import { IconGithub } from '../Icons/IconGithub'
import { Link } from '../Links/Link'

const lastUpdated = DateTime.fromJSDate(new Date(committerDate)).toLocaleString()

export const Stats = memo(function Stats() {
  return (
    <Stack horizontal={false} gap={1} sx={styles.root}>
      <Text size='sm' sx={styles.text}>
        v{version} ({sha.slice(0, 8)})<br /> Last update: {lastUpdated}
      </Text>
      <Link href='https://github.com/cesardeazevedo/nosotros/issues'>
        <Stack gap={0.5} align='flex-start'>
          <IconBug size={18} strokeWidth='1.5' />
          Submit Issue
        </Stack>
      </Link>
      <Link href='https://github.com/cesardeazevedo/nosotros' target='_blank' rel='noopeneer'>
        <Stack align='flex-start'>
          <IconGithub />
          <Text variant='label' size='md' sx={styles.text}>
            GitHub
          </Text>
        </Stack>
      </Link>
    </Stack>
  )
})

const styles = css.create({
  root: {
    opacity: 0.6,
    padding: spacing.padding2,
  },
  text: {
    fontWeight: 500,
  },
})
