import { ContentProvider, useContentContext } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import type { EditorStore } from '@/stores/editor/editor.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css } from 'react-strict-dom'

type Props = {
  store: EditorStore
  renderBubble?: boolean
  sx?: SxProps
  children: React.ReactNode
}

export const EditorContainer = observer(function EditorContainer(props: Props) {
  const { renderBubble, store, sx, children } = props
  const { dense } = useContentContext()
  return (
    <Stack
      horizontal
      align='flex-start'
      justify='space-between'
      gap={renderBubble ? 1 : 2}
      onClick={() => store.setOpen()}
      sx={[styles.root, store.open.value && styles.root$open, sx]}>
      <ContentProvider value={{ dense, disableLink: true, disablePopover: true }}>{children}</ContentProvider>
    </Stack>
  )
})

const styles = css.create({
  root: {
    cursor: 'pointer',
    width: '100%',
    padding: spacing.padding1,
    paddingLeft: spacing.padding2,
    paddingBlock: spacing.padding2,
  },
  root$open: {
    cursor: 'inherit',
    paddingBlock: spacing.padding1,
    paddingTop: spacing.padding2,
  },
})
