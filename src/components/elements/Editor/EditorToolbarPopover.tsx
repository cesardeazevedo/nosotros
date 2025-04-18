import { ContentProvider } from '@/components/providers/ContentProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import type { EditorStore } from '@/stores/editor/editor.store'
import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { css } from 'react-strict-dom'
import { EditorBroadcaster } from './EditorBroadcaster'
import { EditorSettings } from './EditorSettings'
import { EditorZapSplits } from './EditorZapSplit'
import { EditorButtonAddMedia } from './Toolbar/EditorButtonAddMedia'
import { EditorButtonBroadcast } from './Toolbar/EditorButtonBroadcast'
import { EditorButtonReactions } from './Toolbar/EditorButtonReactions'
import { EditorButtonSettings } from './Toolbar/EditorButtonSettings'
import { EditorButtonZapSplits } from './Toolbar/EditorButtonZapSplit'

type Props = {
  store: EditorStore
  children?: ReactNode
}

export const EditorActionsPopover = observer(function EditorActionsPopover(props: Props) {
  const { store, children } = props

  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <ContentProvider value={{ dense: true }}>
        <Stack gap={0.5}>
          <EditorButtonAddMedia store={store} />
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
            {({ getProps, setRef }) => <EditorButtonBroadcast {...getProps()} ref={setRef} store={store} />}
          </PopoverBase>

          <EditorButtonReactions store={store} />

          <PopoverBase
            cursor='arrow'
            opened={store.section === 'zaps'}
            onClose={() => store.openSection('zaps')}
            placement='bottom-start'
            contentRenderer={() => (
              <Paper elevation={2} surface='surfaceContainerLow' sx={styles.wrapper}>
                <EditorZapSplits store={store} />
              </Paper>
            )}>
            {({ getProps, setRef }) => <EditorButtonZapSplits {...getProps()} ref={setRef} store={store} />}
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
            {({ getProps, setRef }) => <EditorButtonSettings {...getProps()} ref={setRef} store={store} />}
          </PopoverBase>
        </Stack>
      </ContentProvider>
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
