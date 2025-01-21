import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import type { EditorStore } from '@/stores/editor/editor.store'
import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { css } from 'react-strict-dom'
import { EditorBroadcaster } from './EditorBroadcaster'
import { EditorMentions } from './EditorMentions'
import { EditorSettings } from './EditorSettings'
import { EditorButtonAddMedia } from './Toolbar/EditorButtonAddMedia'
import { EditorButtonBroadcast } from './Toolbar/EditorButtonBroadcast'
import { EditorButtonMentions } from './Toolbar/EditorButtonMentions'
import { EditorButtonSettings } from './Toolbar/EditorButtonSettings'

type Props = {
  store: EditorStore
  children?: ReactNode
}

export const EditorActionsPopover = observer(function EditorActionsPopover(props: Props) {
  const { store, children } = props

  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <Stack gap={0.5}>
        <EditorButtonAddMedia dense store={store} />
        <PopoverBase
          cursor='arrow'
          opened={store.section === 'broadcast'}
          onClose={() => store.openSection('broadcast')}
          placement='bottom-start'
          contentRenderer={() => (
            <Paper elevation={2} surface='surfaceContainerLow' sx={styles.wrapper}>
              <EditorBroadcaster store={store} />
            </Paper>
          )}>
          {({ getProps, setRef }) => <EditorButtonBroadcast dense {...getProps()} ref={setRef} store={store} />}
        </PopoverBase>

        <PopoverBase
          cursor='arrow'
          opened={store.section === 'mentions'}
          onClose={() => store.openSection('mentions')}
          placement='bottom-start'
          contentRenderer={() => (
            <Paper elevation={2} surface='surfaceContainerLow' sx={styles.wrapper}>
              <EditorMentions store={store} />
            </Paper>
          )}>
          {({ getProps, setRef }) => <EditorButtonMentions dense {...getProps()} ref={setRef} store={store} />}
        </PopoverBase>

        <PopoverBase
          cursor='arrow'
          opened={store.section === 'settings'}
          onClose={() => store.openSection('settings')}
          placement='bottom-start'
          contentRenderer={() => (
            <Paper elevation={2} surface='surfaceContainerLow' sx={styles.wrapper}>
              <EditorSettings store={store} />
            </Paper>
          )}>
          {({ getProps, setRef }) => <EditorButtonSettings dense {...getProps()} ref={setRef} store={store} />}
        </PopoverBase>
      </Stack>
      {children}
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
})
