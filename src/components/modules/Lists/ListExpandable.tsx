import { SidebarSubheader } from '@/components/elements/Sidebar/SidebarSubheader'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import type { Props as StackProps } from '@/components/ui/Stack/Stack'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Event } from '@/stores/events/event'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  events?: Event[]
  onCreate?: () => void
  label?: string
  initialExpanded?: boolean
  renderItem: (event: Event) => ReactNode
  maxHeight?: boolean
  gap?: StackProps['gap']
}

export const ListExpandable = observer(function ListExpandable(props: Props) {
  const { label, events = [], initialExpanded = false, maxHeight = true, gap = 0.5, onCreate, renderItem } = props
  const total = events.length
  return (
    <Expandable
      initiallyExpanded={initialExpanded}
      trigger={(triggerProps) => (
        <SidebarSubheader {...triggerProps} label={`${label} ${total ? `(${total})` : ''}`} onCreateClick={onCreate} />
      )}>
      <Stack gap={gap} horizontal={false} sx={[styles.content, maxHeight && styles.maxHeight]}>
        {events.map(renderItem)}
      </Stack>
    </Expandable>
  )
})

const styles = css.create({
  content: {
    paddingBottom: spacing.padding2,
    marginTop: spacing['margin0.5'],
  },
  maxHeight: {
    maxHeight: 400,
    overflowY: 'auto',
  },
})
