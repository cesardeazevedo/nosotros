import { Button } from '@/components/ui/Button/Button'
import { CircularProgress } from '@/components/ui/Progress/CircularProgress'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { useCurrentUser } from '@/hooks/useAuth'
import { memo, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { useFollowSubmit } from './hooks/useFollowSubmit'

type Props = {
  tag?: string
  value: string
  sx?: SxProps
}

export const FollowButton = memo(function FollowButton(props: Props) {
  const { tag = 'p', value, sx } = props
  const [hover, setHover] = useState(false)
  const currentUser = useCurrentUser()
  const { isPending, mutate } = useFollowSubmit(tag, [value])

  const isFollowing = currentUser?.followsTag(value, tag)
  if (tag === 'p' && value === currentUser.pubkey) {
    return
  }

  return (
    <>
      {isFollowing ? (
        <html.div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <Button
            sx={[styles.root, sx]}
            disabled={isPending}
            variant={hover ? 'danger' : 'outlined'}
            onClick={() => mutate()}>
            <Stack gap={1}>
              {isPending && <CircularProgress size='xs' />}
              {hover ? 'Unfollow' : 'Following'}
            </Stack>
          </Button>
        </html.div>
      ) : (
        <Button sx={[styles.root, sx]} disabled={isPending} variant='filled' onClick={() => mutate()}>
          <Stack gap={1}>
            {isPending && <CircularProgress size='xs' />}
            {isPending ? 'Following' : 'Follow'}
          </Stack>
        </Button>
      )}
    </>
  )
})

const styles = css.create({
  root: {
    minWidth: 95,
    maxWidth: 95,
  },
})
