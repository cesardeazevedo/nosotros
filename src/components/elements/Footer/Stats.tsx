import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useMatch } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { committerDate, sha } from '~build/git'
import { version } from '~build/package'
import { IconGithub } from '../Icons/IconGithub'
import { Link } from '../Links/Link'

const lastUpdated = DateTime.fromJSDate(new Date(committerDate)).toLocaleString()

export const Stats = memo(function Stats() {
  const isDeck = useMatch({ from: '/deck', shouldThrow: false })
  if (isDeck) return null
  return (
    <Stack horizontal={false} gap={1} sx={styles.root}>
      <Text size='sm' sx={styles.text}>
        v{version} ({sha.slice(0, 8)})<br /> Last update: {lastUpdated}
      </Text>
      <Link href='https://github.com/cesardeazevedo/nosotros/issues'>Submit Issue</Link>
      <a href='https://github.com/cesardeazevedo/nosotros' target='_blank' rel='noopeneer'>
        <Stack align='center'>
          <IconGithub />
          <Text variant='label' size='sm'>
            GITHUB
          </Text>
        </Stack>
      </a>
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'fixed',
    left: 24,
    bottom: 24,
    opacity: 0.55,
  },
  text: {
    fontWeight: 500,
  },
})
