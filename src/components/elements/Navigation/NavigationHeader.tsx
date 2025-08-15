import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGoBack, useNostrRoute } from '@/hooks/useNavigations'
import { IconChevronLeft } from '@tabler/icons-react'
import { useMatch } from '@tanstack/react-router'
import type { DecodeResult } from 'nostr-tools/nip19'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'

const getPubkey = (decoded?: DecodeResult) => {
  switch (decoded?.type) {
    case 'nprofile': {
      return decoded.data.pubkey
    }
    case 'npub': {
      return decoded.data
    }
    default: {
      return undefined
    }
  }
}

export const NavigationHeader = memo(function NavigationHeader() {
  useMatch({ from: '__root__' })
  const nostrRoute = useNostrRoute()
  const goBack = useGoBack()

  // TODO: This needs better inference
  let context = null
  if (nostrRoute?.context && 'decoded' in nostrRoute.context) {
    context = nostrRoute.context
  }
  const pubkey = getPubkey(context?.decoded)
  return (
    <Stack justify='flex-start' gap={1} sx={styles.root}>
      <IconButton onClick={goBack} icon={<IconChevronLeft color='currentColor' />} />
      {pubkey ? (
        <Stack horizontal={false}>
          <Stack gap={2}>
            <UserAvatar size='sm' pubkey={pubkey} />
            <UserName variant='title' size='lg' pubkey={pubkey} />
          </Stack>
        </Stack>
      ) : (
        <Text variant='title' size='md'>
          Post
        </Text>
      )}
    </Stack>
  )
})

const styles = css.create({
  root: {
    flex: 1,
  },
})
