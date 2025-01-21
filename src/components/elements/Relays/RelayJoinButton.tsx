import { Button } from '@/components/ui/Button/Button'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentUser } from '@/hooks/useRootStore'
import type { READ, WRITE } from '@/nostr/types'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { html } from 'react-strict-dom'
import { usePublishRelayList } from './relay.hooks'

type Props = {
  relay: string
  permission: typeof READ | typeof WRITE
}

export const RelayJoinButton = observer(function RelayJoinButton(props: Props) {
  const { relay, permission } = props
  const [hover, setHover] = useState(false)
  const currentUser = useCurrentUser()
  const pubkey = currentUser?.pubkey || ''

  const [pending, onSubmit] = usePublishRelayList()

  return (
    <>
      {currentUser?.joinedRelay(relay) ? (
        <html.div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <Button
            disabled={pending}
            variant={hover ? 'danger' : 'outlined'}
            onClick={() => onSubmit([{ pubkey, relay, permission }, true])}>
            <Stack gap={1}>
              {pending && <CircularProgress size='xs' />}
              {pending ? 'Leaving' : hover ? 'Leave' : 'Joined'}
            </Stack>
          </Button>
        </html.div>
      ) : (
        <Button disabled={pending} variant='filled' onClick={() => onSubmit([{ pubkey, relay, permission }, false])}>
          <Stack gap={1}>
            {pending && <CircularProgress size='xs' />}
            {pending ? 'Joining' : 'Join'}
          </Stack>
        </Button>
      )}
    </>
  )
})
