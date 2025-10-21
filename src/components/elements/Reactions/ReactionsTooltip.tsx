import { Paper } from '@/components/ui/Paper/Paper'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'
import { ReactionsNoteList } from './ReactionsNoteList'

type Props = {
  children: React.ReactElement
}

export const ReactionsTooltip = memo(function ReactionsTooltip(props: Props) {
  const { children } = props
  return (
    <TooltipRich
      cursor='dot'
      placement='bottom-start'
      content={() => (
        <Paper surface='surfaceContainer' shape='md' sx={styles.root} elevation={2}>
          <ReactionsNoteList />
        </Paper>
      )}>
      {children}
    </TooltipRich>
  )
})

const styles = css.create({
  root: {
    maxWidth: 355,
    padding: spacing.padding1,
  },
})
