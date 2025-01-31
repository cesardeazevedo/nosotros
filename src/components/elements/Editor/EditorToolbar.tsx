import { Stack } from '@/components/ui/Stack/Stack'
import type { EditorStore } from '@/stores/editor/editor.store'
import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { css } from 'react-strict-dom'
import { EditorButtonAddMedia } from './Toolbar/EditorButtonAddMedia'
import { EditorButtonBroadcast } from './Toolbar/EditorButtonBroadcast'
import { EditorButtonMentions } from './Toolbar/EditorButtonMentions'
import { EditorButtonSettings } from './Toolbar/EditorButtonSettings'
import { EditorButtonZapSplits } from './Toolbar/EditorButtonZapSplit'
import { useContentContext } from '@/components/providers/ContentProvider'

type Props = {
  children?: ReactNode
  store: EditorStore
}

export const EditorToolbar = observer(function EditorToolbar(props: Props) {
  const { store, children } = props
  const { dense } = useContentContext()

  return (
    <Stack horizontal justify='space-between' sx={[styles.root, dense && styles.root$dense]}>
      <Stack gap={0.5}>
        <EditorButtonAddMedia store={store} />
        <EditorButtonBroadcast store={store} />
        <EditorButtonMentions store={store} />
        <EditorButtonZapSplits store={store} />
        {/* <EditorButtonPow dense={dense} store={store} /> */}
        <EditorButtonSettings store={store} />
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
  root$dense: {
    paddingInline: 0,
    paddingBottom: 0,
  },
})
