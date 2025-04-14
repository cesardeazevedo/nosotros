import { Button } from '@/components/ui/Button/Button'
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
import { LinkRelayFeed } from '../Links/LinkRelayFeed'
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

  return (
    <>
      <Stack sx={styles.root} gap={2} align='center' justify='flex-start' onClick={() => setOpen(!opened)}>
        <IconButton
          size='sm'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen((prev) => !prev)
          }}>
          {opened ? <IconChevronDown /> : <IconChevronRight />}
        </IconButton>
        <Stack gap={2} justify='flex-start' sx={styles.content}>
          <RelayIcon url={relay} />
          <Stack horizontal={false} align='flex-start' justify='center' gap={1}>
            <Stack horizontal={false} justify='center' align='flex-start'>
              <Text variant='title' size='lg' sx={styles.breakWord}>
                {info?.name || pretty}
              </Text>
              {/* <Text sx={styles.minichip} size='md'> */}
              {/*   {pretty} */}
              {/*   <RelayConnectedIcon url={relay} /> */}
              {/* </Text> */}
              <Text variant='body' size='md' sx={styles.breakWord}>
                {info?.description}
              </Text>
            </Stack>
            {/* <RelayChip url={relay} renderDisconnectedIcon={false} onClick={() => setOpened((prev) => !prev)} /> */}
          </Stack>
        </Stack>
        <Stack horizontal={false}>
          <LinkRelayFeed url={relay}>
            <Button variant='outlined' trailingIcon={<IconChevronRight size={18} strokeWidth='2' />}>
              Explore
            </Button>
          </LinkRelayFeed>
        </Stack>
      </Stack>
      {opened && <RelayRowDetails relay={relay} latency={rtt} />}
    </>
  )
}

const styles = css.create({
  root: {
    cursor: 'pointer',
    padding: spacing.padding2,
    paddingBlock: spacing['padding1'],
    // borderBottom: '1px solid',
    // borderBottomColor: palette.outlineVariant,
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
  },
  minichip: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 6,
    paddingRight: 2,
    paddingBlock: 0,
    height: 18,
    //lineHeight: '12px',
    borderRadius: shape.lg,
    backgroundColor: palette.surfaceContainer,
  },
})
