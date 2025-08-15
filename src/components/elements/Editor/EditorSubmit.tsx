import { useContentContext } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { memo, useCallback } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { LinkSignIn } from '../Links/LinkSignIn'
import { useEditorSelector } from './hooks/useEditor'
import { cancel$ } from './utils/countDown'

type Props = {
  renderDiscard?: boolean
  onSubmit: () => void
  onDiscard?: () => void
  disabled?: boolean
  state: number | string | boolean
}

export const EditorSubmit = memo(function EditorSubmit(props: Props) {
  const { state, disabled, renderDiscard, onSubmit, onDiscard } = props
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()

  const reset = useEditorSelector((editor) => editor.reset)
  const isReply = useEditorSelector((editor) => !!editor.parent)
  const isCountDown = typeof state === 'number'

  const handleDiscard = useCallback((event: StrictClickEvent) => {
    event.stopPropagation()
    event.preventDefault()
    reset()
    onDiscard?.()
  }, [])

  return (
    <Stack gap={0.5}>
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
          {isCountDown
            ? state === 0
              ? isReply
                ? 'Replying'
                : 'Posting'
              : `${isReply ? 'Replying' : 'Posting'} in ${state} (cancel)`
            : isReply
              ? 'Reply'
              : 'Post'}
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
