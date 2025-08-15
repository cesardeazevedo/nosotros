import { Chip } from '@/components/ui/Chip/Chip'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useRelayInfo } from '@/hooks/query/useRelayInfo'
import { spacing } from '@/themes/spacing.stylex'
import { IconCoinBitcoin } from '@tabler/icons-react'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { UserHeader } from '../User/UserHeader'
import { RelayFriendsList } from './RelayFriendsList'
import { RelayIcon } from './RelayIcon'
import { RelayNips } from './RelayNips'

type Props = {
  url: string
}

export const RelayHeader = memo(function RelayHeader(props: Props) {
  const { url } = props
  const { data: relay } = useRelayInfo(url)

  return (
    <>
      <Stack horizontal={false} gap={1} sx={styles.content}>
        <Stack justify='space-between'>
          <RelayIcon url={url} sx={styles.avatar} />
          {relay?.limitation?.payment_required && (
            <a href={relay?.payments_url} rel='noopener noreferrer'>
              <Chip icon={<IconCoinBitcoin size={18} strokeWidth='1.5' />} label='Payment Required' />
            </a>
          )}
        </Stack>
        <Stack horizontal={false}>
          <Text variant='headline' size='sm'>
            {relay?.name || url}
          </Text>
          {relay?.description && (
            <Text variant='label' size='lg'>
              {relay.description}
            </Text>
          )}
        </Stack>
        <Stack horizontal={false} gap={0.5} sx={styles.meta}>
          {relay?.software && (
            <Text variant='title' size='sm'>
              Software:
              {relay.software}
              {relay.version ? ` • ${relay.version}` : ''}
            </Text>
          )}
          <RelayNips nips={relay?.supported_nips} />
          <Text variant='title' size='sm'>
            Contact: {relay?.contact}
          </Text>
        </Stack>
        <Stack grow justify='space-between'>
          {relay?.pubkey && (
            <Stack grow sx={styles.contact} horizontal={false}>
              <Text variant='title' size='sm'>
                Owner
              </Text>
              <Stack horizontal={false}>
                <UserHeader pubkey={relay.pubkey} userAvatarProps={{ size: 'sm' }} />
              </Stack>
            </Stack>
          )}
          <Stack sx={styles.contact} horizontal={false} gap={2}>
            <Text variant='title' size='sm'>
              People joined this relay
            </Text>
            <RelayFriendsList url={url} />
          </Stack>
        </Stack>
      </Stack>
    </>
  )
})

const styles = css.create({
  root: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  icon: {
    marginTop: spacing.margin1,
  },
  bannerArea: {
    width: '100%',
    height: 120,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  bannerFallback: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(0deg, rgba(0,0,0,0.06), rgba(0,0,0,0.06))',
  },
  content: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  avatar: {
    marginTop: spacing.margin1,
  },
  meta: {
    opacity: 0.9,
  },
  contact: {
    marginTop: spacing.margin1,
  },
})
