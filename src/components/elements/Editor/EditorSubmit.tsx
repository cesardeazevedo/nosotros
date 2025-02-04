import { useContentContext } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import type { EditorStore } from '@/stores/editor/editor.store'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { LinkSignIn } from '../Links/LinkSignIn'
import { cancel$ } from './utils/countDown'

type Props = {
  store: EditorStore
  renderDiscard?: boolean
  onSubmit: () => void
  onDiscard?: () => void
  disabled?: boolean
  state: number | string | boolean
}

export const EditorSubmit = observer(function EditorSubmit(props: Props) {
  const { store, state, disabled, renderDiscard, onSubmit, onDiscard } = props
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()

  const isCountDown = typeof state === 'number'

  const handleDiscard = useCallback((event: StrictClickEvent) => {
    event.stopPropagation()
    event.preventDefault()
    store.reset()
    onDiscard?.()
  }, [])

  return (
    <Stack gap={1}>
      {renderDiscard && (
        <Button sx={[dense && styles.button$dense]} onClick={handleDiscard}>
          Discard
        </Button>
      )}
      {!pubkey && (
        <LinkSignIn>
          <Button sx={[dense && styles.button$dense]} variant='filled'>
            Sign In
          </Button>
        </LinkSignIn>
      )}
      {pubkey && (
        <Button
          disabled={disabled}
          sx={[dense && styles.button$dense]}
          variant='filled'
          onClick={() => (isCountDown ? cancel$.next() : onSubmit())}>
          {isCountDown ? (state === 0 ? 'Posting' : `Posting in ${state} (cancel)`) : 'Post'}
        </Button>
      )}
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    alignItems: 'flex-end',
  },
  root$dense: {
    paddingInline: 0,
    paddingBottom: 0,
  },
  button$dense: {
    minHeight: 32,
  },
})
