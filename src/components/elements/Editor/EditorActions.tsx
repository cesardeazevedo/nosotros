import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { EditorStore } from '@/stores/editor/editor.store'
import { IconCode, IconCpu, IconPhotoPlus, IconServerBolt } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

type Props = {
  dense?: boolean
  renderDiscard?: boolean
  store: EditorStore
}

export const EditorActions = observer(function EditorActions(props: Props) {
  const { store, dense, renderDiscard = false } = props

  const handleDiscard = useCallback((event: StrictClickEvent) => {
    event.stopPropagation()
    event.preventDefault()
    store.onDiscard()
  }, [])

  return (
    <Stack horizontal justify='space-between' sx={[styles.root, dense && styles.root$dense]}>
      <Stack gap={0.5}>
        <Tooltip cursor='arrow' text='Add Media' enterDelay={200}>
          <IconButton
            size={dense ? 'sm' : 'md'}
            onClick={store.selectFiles}
            icon={<IconPhotoPlus size={dense ? 20 : 22} strokeWidth='1.6' />}
          />
        </Tooltip>
        <Tooltip cursor='arrow' text='Select relays' enterDelay={200}>
          <IconButton
            toggle={store.broadcast.value}
            size={dense ? 'sm' : 'md'}
            icon={<IconServerBolt size={dense ? 20 : 22} strokeWidth='1.6' />}
            onClick={() => store.broadcast.toggle()}
          />
        </Tooltip>
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && (
          <Tooltip cursor='arrow' text='Proof of Work (PoW)' enterDelay={200}>
            <IconButton
              toggle={store.pow.value}
              size={dense ? 'sm' : 'md'}
              icon={<IconCpu size={dense ? 20 : 22} strokeWidth='1.6' />}
              onClick={() => store.pow.toggle()}
            />
          </Tooltip>
        )}
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && (
          <Tooltip cursor='arrow' text='See raw event' enterDelay={200}>
            <IconButton
              toggle={store.jsonView.value}
              size={dense ? 'sm' : 'md'}
              icon={<IconCode size={dense ? 20 : 22} strokeWidth='1.6' />}
              onClick={() => store.jsonView.toggle()}
            />
          </Tooltip>
        )}
      </Stack>
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
