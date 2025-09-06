import { useContentContext } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { css } from 'react-strict-dom'
import { LinkSignIn } from '../Links/LinkSignIn'
import { cancel$ } from './utils/countDown'

type Props = {
  onSubmit: () => void
  disabled?: boolean
  state: number | string | boolean
}

export const EditorSubmitButton = (props: Props) => {
  const { state, disabled, onSubmit } = props
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()
  const isCountDown = typeof state === 'number'

  if (!pubkey) {
    return (
      <LinkSignIn>
        <Button sx={[dense && styles.dense]} variant='filled'>
          Sign In
        </Button>
      </LinkSignIn>
    )
  }
  return (
    <Button
      disabled={disabled}
      sx={[dense && styles.dense]}
      variant={isCountDown ? 'filledTonal' : 'filled'}
      onClick={() => (isCountDown ? cancel$.next() : onSubmit())}>
      {isCountDown ? (state === 0 ? 'Posting' : `Posting in ${state} (cancel)`) : 'Post'}
    </Button>
  )
}

const styles = css.create({
  dense: {
    minHeight: 32,
  },
})
