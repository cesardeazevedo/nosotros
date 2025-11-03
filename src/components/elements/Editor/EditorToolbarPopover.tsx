import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { memo, type ReactNode } from 'react'
import { css } from 'react-strict-dom'
import { EditorBroadcaster } from './EditorBroadcaster'
import { EditorSettings } from './EditorSettings'
import { useEditorSelector } from './hooks/useEditor'
import { EditorButtonAddMedia } from './Toolbar/EditorButtonAddMedia'
import { EditorButtonBroadcast } from './Toolbar/EditorButtonBroadcast'
import { EditorButtonMaximize } from './Toolbar/EditorButtonMaximize'
import { EditorButtonReactions } from './Toolbar/EditorButtonReactions'
import { EditorButtonSettings } from './Toolbar/EditorButtonSettings'

type Props = {
  children?: ReactNode
}

export const EditorActionsPopover = memo(function EditorActionsPopover(props: Props) {
  const { children } = props
  const { isDialog } = useContentContext()
  const parent = useEditorSelector((editor) => editor.parent)
  const section = useEditorSelector((editor) => editor.section)
  const openSection = useEditorSelector((editor) => editor.openSection)

  return (
    <Stack horizontal justify='space-between' sx={styles.root}>
      <ContentProvider value={{ dense: true }}>
        <Stack gap={0.5}>
          <EditorButtonAddMedia />
          <PopoverBase
            cursor='arrow'
            opened={section === 'broadcast'}
            onClose={() => openSection('broadcast')}
            placement='bottom-start'
            contentRenderer={() => (
              <Paper elevation={2} surface='surfaceContainerLow' sx={styles.wrapper}>
                <EditorBroadcaster />
              </Paper>
            )}>
            {({ getProps, setRef }) => <EditorButtonBroadcast {...getProps()} ref={setRef} />}
          </PopoverBase>

          <EditorButtonReactions />

          {/* <PopoverBase */}
          {/*   cursor='arrow' */}
          {/*   opened={section === 'zaps'} */}
          {/*   onClose={() => openSection('zaps')} */}
          {/*   placement='bottom-start' */}
          {/*   contentRenderer={() => ( */}
          {/*     <Paper elevation={2} surface='surfaceContainerLow' sx={styles.wrapper}> */}
          {/*       <EditorZapSplits /> */}
          {/*     </Paper> */}
          {/*   )}> */}
          {/*   {({ getProps, setRef }) => <EditorButtonZapSplits {...getProps()} ref={setRef} />} */}
          {/* </PopoverBase> */}

          <PopoverBase
            cursor='arrow'
            opened={section === 'settings'}
            onClose={() => openSection('settings')}
            placement='bottom-start'
            contentRenderer={() => (
              <Paper elevation={2} surface='surfaceContainerLow' sx={styles.wrapper}>
                <EditorSettings float />
              </Paper>
            )}>
            {/* @ts-ignore */}
            {({ getProps, setRef }) => <EditorButtonSettings {...getProps()} ref={setRef} />}
          </PopoverBase>
          {parent && !isDialog && <EditorButtonMaximize parent={parent} />}
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
    paddingTop: spacing.padding1,
  },
  wrapper: {
    maxWidth: 490,
  },
})
