import { useContentContext } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { memo, type ReactNode } from 'react'
import { css } from 'react-strict-dom'
import { EditorButtonAddMedia } from './Toolbar/EditorButtonAddMedia'
import { EditorButtonBroadcast } from './Toolbar/EditorButtonBroadcast'
import { EditorButtonReactions } from './Toolbar/EditorButtonReactions'
import { EditorButtonSettings } from './Toolbar/EditorButtonSettings'
import { EditorButtonZapSplits } from './Toolbar/EditorButtonZapSplit'
import { spacing } from '@/themes/spacing.stylex'

type Props = {
  children?: ReactNode
  renderAddMedia?: boolean
}

export const EditorToolbar = memo(function EditorToolbar(props: Props) {
  const { children, renderAddMedia = true } = props
  const { dense } = useContentContext()

  return (
    <Stack horizontal justify='space-between' sx={[styles.root, dense && styles.root$dense]}>
      <Stack>
        {renderAddMedia && <EditorButtonAddMedia />}
        <EditorButtonBroadcast />
        <EditorButtonReactions />
        <EditorButtonZapSplits />
        {/* <EditorButtonPow dense={dense} store={store} /> */}
        <EditorButtonSettings />
      </Stack>
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
  root$dense: {
    paddingInline: 0,
    paddingBottom: 0,
  },
})
