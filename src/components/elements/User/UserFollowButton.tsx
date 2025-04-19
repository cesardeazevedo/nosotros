import { Button } from '@/components/ui/Button/Button'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentAccount, useCurrentUser } from '@/hooks/useRootStore'
import { publishFollowList } from '@/nostr/publish/publishFollowList'
import type { Account } from '@/stores/auth/account.store'
import { observer } from 'mobx-react-lite'
import { useObservableState } from 'observable-hooks'
import { useState } from 'react'
import { css, html } from 'react-strict-dom'
import { catchError, map, mergeMap, of, startWith } from 'rxjs'

type Props = {
  pubkey: string
}

export const UserFollowButton = observer(function UserFollowButton(props: Props) {
  const { pubkey } = props
  const [hover, setHover] = useState(false)
  const acc = useCurrentAccount()
  const currentUser = useCurrentUser()

  const [pending, onSubmit] = useObservableState<boolean, Account>((input$) => {
    return input$.pipe(
      mergeMap((acc) => {
        if (acc.signer) {
          return publishFollowList(acc.pubkey, 'p', pubkey, { signer: acc.signer?.signer }).pipe(
            map(() => false),
            catchError(() => of(false)),
            startWith(true),
          )
        }
        throw new Error('Not authenticated')
      }),
    )
  }, false)

  const isFollowing = currentUser?.followsPubkey(pubkey)

  if (currentUser?.pubkey === pubkey) {
    // don't show the follow button for the same logged person
    return
  }

  return (
    <>
      {isFollowing ? (
        <html.div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <Button
            sx={styles.root}
            disabled={pending}
            variant={hover ? 'danger' : 'outlined'}
            onClick={() => acc && onSubmit(acc)}>
            <Stack gap={1}>
              {pending && <CircularProgress size='xs' />}
              {hover ? 'Unfollow' : 'Following'}
            </Stack>
          </Button>
        </html.div>
      ) : (
        <Button sx={styles.root} disabled={pending} variant='filled' onClick={() => acc && onSubmit(acc)}>
          <Stack gap={1}>
            {pending && <CircularProgress size='xs' />}
            {pending ? 'Following' : 'Follow'}
          </Stack>
        </Button>
      )}
    </>
  )
})

const styles = css.create({
  root: {
    width: 95,
  },
})
