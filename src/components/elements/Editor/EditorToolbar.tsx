import { useContentContext } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { EditorStore } from '@/stores/editor/editor.store'
import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { css } from 'react-strict-dom'
import { EditorButtonAddMedia } from './Toolbar/EditorButtonAddMedia'
import { EditorButtonBroadcast } from './Toolbar/EditorButtonBroadcast'
import { EditorButtonReactions } from './Toolbar/EditorButtonReactions'
import { EditorButtonSettings } from './Toolbar/EditorButtonSettings'
import { EditorButtonZapSplits } from './Toolbar/EditorButtonZapSplit'

type Props = {
  children?: ReactNode
  store: EditorStore
  renderAddMedia?: boolean
}

export const EditorToolbar = observer(function EditorToolbar(props: Props) {
  const { store, children, renderAddMedia = true } = props
  const { dense } = useContentContext()

  return (
    <Stack horizontal justify='space-between' sx={[styles.root, dense && styles.root$dense]}>
      <Stack>
        {renderAddMedia && <EditorButtonAddMedia store={store} />}
        <EditorButtonBroadcast store={store} />
        <EditorButtonReactions store={store} />
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
