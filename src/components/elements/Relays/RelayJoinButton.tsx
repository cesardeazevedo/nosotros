import { Button } from '@/components/ui/Button/Button'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { useUserRelays } from '@/hooks/query/useQueryUser'
import { useCurrentUser } from '@/hooks/useAuth'
import { READ, WRITE } from '@/nostr/types'
import { memo, useState } from 'react'
import { html } from 'react-strict-dom'
import { usePublishRelayList } from './relay.hooks'

type Props = {
  relay: string
  permission: typeof READ | typeof WRITE
}

export const RelayJoinButton = memo(function RelayJoinButton(props: Props) {
  const { relay, permission } = props
  const [hover, setHover] = useState(false)
  const currentUser = useCurrentUser()
  const pubkey = currentUser?.pubkey || ''

  const { mutate, isPending } = usePublishRelayList()
  const relayList = useUserRelays(pubkey, READ & WRITE).data?.map((x) => x.relay) || []
  const joined = relayList.includes(relay) || false

  return (
    <>
      {joined ? (
        <html.div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <Button
            disabled={isPending}
            variant={hover ? 'danger' : 'outlined'}
            onClick={() => mutate([{ pubkey, relay, permission }, true])}>
            <Stack gap={1}>
              {isPending && <CircularProgress size='xs' />}
              {isPending ? 'Leaving' : hover ? 'Leave' : 'Joined'}
            </Stack>
          </Button>
        </html.div>
      ) : (
        <Button disabled={isPending} variant='filled' onClick={() => mutate([{ pubkey, relay, permission }, false])}>
          <Stack gap={1}>
            {isPending && <CircularProgress size='xs' />}
            {isPending ? 'Joining' : 'Join'}
          </Stack>
        </Button>
      )}
    </>
  )
})
