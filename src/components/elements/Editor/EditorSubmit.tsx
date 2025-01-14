import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import type { EditorStore } from '@/stores/editor/editor.store'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

type Props = {
  store: EditorStore
  dense?: boolean
  renderDiscard?: boolean
}

export const EditorSubmit = (props: Props) => {
  const { store, dense, renderDiscard } = props

  const handleDiscard = useCallback((event: StrictClickEvent) => {
    event.stopPropagation()
    event.preventDefault()
    store.reset()
  }, [])

  return (
    <Stack gap={1}>
      {renderDiscard && (
        <Button sx={[dense && styles.button$dense]} onClick={handleDiscard}>
          Discard
        </Button>
      )}
      <Button
        disabled={store.isUploading.value}
        sx={[dense && styles.button$dense]}
        variant='filled'
        onClick={store.onSubmit}>
        Post
      </Button>
    </Stack>
  )
}

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
