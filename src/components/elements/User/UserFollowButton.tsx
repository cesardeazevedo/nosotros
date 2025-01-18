import { Button } from '@/components/ui/Button/Button'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentUser, useRootContext } from '@/hooks/useRootStore'
import type { NostrContext } from '@/stores/context/nostr.context.store'
import { observer } from 'mobx-react-lite'
import { useObservableState } from 'observable-hooks'
import { useMemo, useState } from 'react'
import { html } from 'react-strict-dom'
import { catchError, last, map, mergeMap, of, startWith } from 'rxjs'

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
          return context.client.follows.publish('p', context.client.pubkey, pubkey).pipe(
            map(() => true),
            last(),
            map(() => false),
            catchError(() => of(false)),
            startWith(true),
          )
        }
        throw new Error('Not authenticated')
      }),
    )
  }, false)

  const isFollowing = useMemo(() => currentUser?.following?.followsPubkey(pubkey), [pending])

  return (
    <>
      {isFollowing ? (
        <html.div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <Button disabled={pending} variant={hover ? 'danger' : 'outlined'} onClick={() => onSubmit(rootContext)}>
            <Stack gap={1}>
              {pending && <CircularProgress size='xs' />}
              {pending ? 'Unfollowing' : hover ? 'Unfollow' : 'Following'}
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
