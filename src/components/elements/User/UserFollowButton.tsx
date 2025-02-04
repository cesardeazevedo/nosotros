import { Button } from '@/components/ui/Button/Button'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentUser, useRootContext } from '@/hooks/useRootStore'
import { publishFollowList } from '@/nostr/publish/publishFollowList'
import type { NostrContext } from '@/stores/context/nostr.context.store'
import { observer } from 'mobx-react-lite'
import { useObservableState } from 'observable-hooks'
import { useState } from 'react'
import { html } from 'react-strict-dom'
import { catchError, map, mergeMap, of, startWith } from 'rxjs'

type Props = {
  pubkey: string
}

export const UserFollowButton = observer(function UserFollowButton(props: Props) {
  const { pubkey } = props
  const [hover, setHover] = useState(false)
  const rootContext = useRootContext()
  const currentUser = useCurrentUser()

  const [pending, onSubmit] = useObservableState<boolean, NostrContext>((input$) => {
    return input$.pipe(
      mergeMap((context) => {
        if (context.client.pubkey) {
          return publishFollowList(context.client, 'p', pubkey).pipe(
            map(() => false),
            catchError(() => of(false)),
            startWith(true),
          )
        }
        throw new Error('Not authenticated')
      }),
    )
  }, false)

  const isFollowing = currentUser?.following?.followsPubkey(pubkey)

  if (currentUser?.pubkey === pubkey) {
    // don't show the follow button for the same logged person
    return
  }

  return (
    <>
      {isFollowing ? (
        <html.div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <Button disabled={pending} variant={hover ? 'danger' : 'outlined'} onClick={() => onSubmit(rootContext)}>
            <Stack gap={1}>
              {pending && <CircularProgress size='xs' />}
              {hover ? 'Unfollow' : 'Following'}
            </Stack>
          </Button>
        </html.div>
      ) : (
        <Button disabled={pending} variant='filled' onClick={() => onSubmit(rootContext)}>
          <Stack gap={1}>
            {pending && <CircularProgress size='xs' />}
            {pending ? 'Following' : 'Follow'}
          </Stack>
        </Button>
      )}
    </>
  )
})
