import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { prettyRelayUrl } from '@/core/helpers/formatRelayUrl'
import { relaysStore } from '@/stores/relays/relays.store'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { LinkRelayFeed } from '../Links/LinkRelayFeed'
import { RelayConnectedIcon } from './RelayConnectedIcon'
import { RelayDescription } from './RelayDescription'
import { RelayIcon } from './RelayIcon'
import { RelayRowDetails } from './RelayRowDetails'

export type Props = {
  relay: string
  relayPubkey?: string
  rtt?: number | string
  authRequired?: boolean
  paymentRequired?: boolean
}

export const RelayListRow = (props: Props) => {
  const { relay, rtt } = props
  const [opened, setOpen] = useState(false)
  const info = relaysStore.getInfo(relay)
  const pretty = useMemo(() => prettyRelayUrl(relay), [])

  const toggle = (e: StrictClickEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setOpen((prev) => !prev)
  }

  return (
    <>
      <LinkRelayFeed url={relay}>
        <Stack sx={styles.root} gap={1} align='center' justify='space-between'>
          <Stack grow gap={2} justify='flex-start' sx={styles.content}>
            <IconButton size='sm' onClick={toggle}>
              {opened ? <IconChevronDown /> : <IconChevronRight />}
            </IconButton>
            <RelayIcon url={relay} />
            <Stack horizontal={false} align='flex-start' justify='center' gap={1}>
              <Stack horizontal={false} justify='center' align='flex-start'>
                <Text sx={styles.minichip} size='sm'>
                  {pretty}
                  <RelayConnectedIcon url={relay} />
                </Text>
                <Text variant='title' size='lg' sx={styles.breakWord}>
                  {info?.name || pretty}
                </Text>
                <RelayDescription description={info?.description} />
              </Stack>
            </Stack>
          </Stack>
          <Stack horizontal={false}>
            <IconChevronRight size={20} strokeWidth={'1.5'} />
          </Stack>
        </Stack>
      </LinkRelayFeed>
      {opened && <RelayRowDetails relay={relay} latency={rtt} />}
    </>
  )
}

const styles = css.create({
  root: {
    cursor: 'pointer',
    width: '100%',
    paddingInline: spacing.padding1,
    paddingRight: spacing.padding2,
    paddingBlock: spacing.padding1,
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
    minHeight: 70,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 135, 0.05)',
    },
  },
  breakWord: {
    wordBreak: 'break-word',
  },
  content: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  minichip: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBlock: 0,
    height: 18,
    //lineHeight: '12px',
    borderRadius: shape.lg,
    backgroundColor: palette.surfaceContainer,
  },
})
