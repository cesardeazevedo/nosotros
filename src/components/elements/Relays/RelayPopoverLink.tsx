import { Button } from '@/components/ui/Button/Button'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { formatRelayUrl, prettyRelayUrl } from '@/core/helpers/formatRelayUrl'
import { enqueueRelayInfo } from '@/nostr/nip11'
import { relaysStore } from '@/stores/relays/relays.store'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { css, html } from 'react-strict-dom'
import { LinkRelayFeed } from '../Links/LinkRelayFeed'
import { RelayChip } from './RelayChip'
import { RelayIcon } from './RelayIcon'

type Props = {
  url: string
  children: React.ReactNode
}

const PopoverContent = observer(function PopoverContent(props: { url: string }) {
  const { url } = props
  const pretty = prettyRelayUrl(url)
  const info = relaysStore.getInfo(url)

  useEffect(() => {
    enqueueRelayInfo(url)
  }, [url])

  return (
    <Paper elevation={2} surface='surfaceContainerLow' sx={styles.root}>
      <Stack gap={2} justify='space-between'>
        <Stack horizontal={false} gap={1}>
          <Stack>
            {info?.icon && <RelayIcon size='md' url={url} />}
            <Text variant='title' size='lg'>
              {info?.name || pretty}
            </Text>
          </Stack>
          <RelayChip icon={false} url={url} />
        </Stack>
        <LinkRelayFeed url={url}>
          <Button variant='outlined'>See Feed</Button>
        </LinkRelayFeed>
      </Stack>
      <br />
      <Stack horizontal={false} gap={1} align='flex-start'>
        <Text variant='body' size='lg'>
          {info?.description}
        </Text>
      </Stack>
    </Paper>
  )
})

export const RelayPopoverLink = observer(function RelayPopoverLink(props: Props) {
  const url = formatRelayUrl(props.url)
  return (
    <TooltipRich cursor='dot' content={() => <PopoverContent url={url} />} placement='bottom-start'>
      <html.span style={styles.link}>
        <RelayIcon size='xs' url={url} sx={styles.avatar} />
        {props.children}
      </html.span>
    </TooltipRich>
  )
})

const styles = css.create({
  root: {
    width: 340,
    maxHeight: 290,
    padding: spacing.padding2,
  },
  link: {
    display: 'inline',
    borderRadius: 6,
    backgroundColor: palette.surfaceContainer,
    paddingInline: 2,
    paddingTop: 1,
    paddingBottom: 1,
  },
  avatar: {
    position: 'relative',
    display: 'inline-block',
    width: 16,
    height: 16,
    top: 2,
    marginRight: 2,
  },
})
