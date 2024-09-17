import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import React from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  label: React.ReactNode
  trailing?: React.ReactNode
  children?: React.ReactNode
  inset?: boolean
}

export const SettingsHeader = (props: Props) => (
  <Expandable
    defaultExpanded={false}
    trigger={({ expand, expanded }) => (
      <>
        <html.div style={[styles.root, props.inset && styles.inset]} onClick={() => expand(!expanded)}>
          <Stack horizontal gap={1}>
            <IconButton size='sm' icon={expanded ? <IconChevronDown /> : <IconChevronRight />} />
            <Text variant='title' size='md'>
              {props.label}
            </Text>
            {props.trailing}
          </Stack>
        </html.div>
        <Divider />
      </>
    )}>
    <html.span style={styles.content}>{props.children}</html.span>
  </Expandable>
)

const styles = css.create({
  root: {
    padding: spacing.padding1,
    backgroundColor: palette.surfaceContainerLowest,
  },
  inset: {
    paddingLeft: spacing.padding2,
  },
  content: {
    position: 'relative',
    zIndex: 100,
    backgroundColor: 'green',
  },
})
