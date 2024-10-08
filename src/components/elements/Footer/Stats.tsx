import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useMatch } from '@tanstack/react-router'
import { useMobile } from 'hooks/useMobile'
import { DateTime } from 'luxon'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { committerDate, sha } from '~build/git'
import { version } from '~build/package'
import { IconGithub } from '../Icons/IconGithub'

const lastUpdated = DateTime.fromJSDate(new Date(committerDate)).toLocaleString()

const Stats = memo(function Stats() {
  const isMobile = useMobile()
  const isDeck = useMatch({ from: '/deck', shouldThrow: false })
  if (isMobile || isDeck) return null
  return (
    <Stack horizontal={false} gap={1} sx={styles.root}>
      <Text size='sm' sx={styles.text}>
        v{version} ({sha.slice(0, 8)})<br /> Last update: {lastUpdated}
      </Text>
      <Tooltip placement='bottom-start' cursor='arrow' text='See open source code' enterDelay={0}>
        <a href='https://github.com/cesardeazevedo/nosotros' target='_blank' rel='noopeneer'>
          <Stack align='center'>
            <IconGithub />
            <Text variant='label' size='sm'>
              GITHUB
            </Text>
          </Stack>
        </a>
      </Tooltip>
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

export default Stats
