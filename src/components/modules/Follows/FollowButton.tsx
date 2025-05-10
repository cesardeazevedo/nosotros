import { Button } from '@/components/ui/Button/Button'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useCurrentAccount, useCurrentUser } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css, html } from 'react-strict-dom'
import { useFollowSubmit } from './hooks/useFollowSubmit'

type Props = {
  pubkey: string
  sx?: SxProps
}

export const FollowButton = observer(function FollowButton(props: Props) {
  const { pubkey, sx } = props
  const [hover, setHover] = useState(false)
  const acc = useCurrentAccount()
  const currentUser = useCurrentUser()
  const [pending, onSubmit] = useFollowSubmit([pubkey])

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
            sx={[styles.root, sx]}
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
        <Button sx={[styles.root, sx]} disabled={pending} variant='filled' onClick={() => acc && onSubmit(acc)}>
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
