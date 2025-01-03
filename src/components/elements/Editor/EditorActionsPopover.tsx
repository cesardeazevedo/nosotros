import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { EditorStore } from '@/stores/editor/editor.store'
import { IconCode, IconPhotoPlus, IconServerBolt } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { EditorBroadcaster } from './EditorBroadcaster'
import { EditorJson } from './EditorJson'

type Props = {
  renderDiscard?: boolean
  store: EditorStore
}

export const EditorActionsPopover = observer(function EditorActionsPopover(props: Props) {
  const { store, renderDiscard = false } = props

  const handleDiscard = useCallback((event: StrictClickEvent) => {
    event.stopPropagation()
    event.preventDefault()
    store.onDiscard()
  }, [])

  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <Stack gap={0.5}>
        <Tooltip cursor='arrow' text='Add Media' enterDelay={200}>
          <IconButton size={'sm'} onClick={store.selectFiles} icon={<IconPhotoPlus size={20} strokeWidth='1.6' />} />
        </Tooltip>
        <PopoverBase
          cursor='arrow'
          opened={store.broadcast.value}
          onClose={() => store.broadcast.toggle(false)}
          placement='bottom-start'
          contentRenderer={() => (
            <Paper elevation={2} surface='surfaceContainerLowest' sx={styles.wrapper}>
              <EditorBroadcaster store={store} />
            </Paper>
          )}>
          {({ getProps, setRef }) => (
            <Tooltip cursor='arrow' text='Select relays' enterDelay={200}>
              <IconButton
                {...getProps()}
                ref={setRef}
                toggle={store.broadcast.value}
                size={'sm'}
                icon={<IconServerBolt size={20} strokeWidth='1.6' />}
                onClick={() => store.broadcast.toggle()}
              />
            </Tooltip>
          )}
        </PopoverBase>
        {/* Json view for tests */}
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && (
          <PopoverBase
            opened={store.jsonView.value}
            onClose={() => store.jsonView.toggle(false)}
            placement='bottom-start'
            contentRenderer={() => (
              <Paper elevation={2} surface='surfaceContainerLowest' sx={styles.wrapper}>
                <EditorJson editor={store} />
              </Paper>
            )}>
            {({ getProps, setRef }) => (
              <Tooltip cursor='arrow' text='See raw event' enterDelay={200}>
                <IconButton
                  size='sm'
                  {...getProps()}
                  ref={setRef}
                  toggle={store.jsonView.value}
                  icon={<IconCode size={20} strokeWidth='1.6' />}
                  onClick={() => store.jsonView.toggle()}
                />
              </Tooltip>
            )}
          </PopoverBase>
        )}
      </Stack>
      <Stack gap={1}>
        {renderDiscard && (
          <Button sx={styles.button} onClick={handleDiscard}>
            Discard
          </Button>
        )}
        <Button disabled={store.isUploading.value} sx={styles.button} variant='filled' onClick={store.onSubmit}>
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
  wrapper: {
    maxWidth: 490,
  },
  button: {
    minHeight: 32,
  },
})
