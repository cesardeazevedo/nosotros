import { useContentContext } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { memo, useCallback } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { LinkSignIn } from '../Links/LinkSignIn'
import { useEditorSelector } from './hooks/useEditor'
import { useXS } from '@/hooks/useMobile'

type Props = {
  renderDiscard?: boolean
  onSubmit: () => void
  onDiscard?: () => void
  disabled?: boolean
  submitting: boolean
}

export const EditorSubmit = memo(function EditorSubmit(props: Props) {
  const { submitting, disabled, renderDiscard, onSubmit, onDiscard } = props
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()
  const isXS = useXS()

  const reset = useEditorSelector((editor) => editor.reset)
  const isReply = useEditorSelector((editor) => !!editor.parent && editor.parent.kind !== Kind.PublicMessage)

  const handleDiscard = useCallback((event: StrictClickEvent) => {
    event.stopPropagation()
    event.preventDefault()
    reset()
    onDiscard?.()
  }, [])

  return (
    <Stack gap={0.5}>
      {renderDiscard && !isXS && !submitting && (
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
        <Button disabled={disabled} sx={[dense && styles.button$dense]} variant='filled' onClick={() => onSubmit()}>
          {submitting ? (isReply ? 'Replying' : 'Posting') : isReply ? 'Reply' : 'Post'}
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
