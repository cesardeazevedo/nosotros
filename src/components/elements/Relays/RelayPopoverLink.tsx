import { Divider } from '@/components/ui/Divider/Divider'
import { Paper } from '@/components/ui/Paper/Paper'
import { Text } from '@/components/ui/Text/Text'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { spacing } from '@/themes/spacing.stylex'
import { useMemo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  url: string
  children: React.ReactNode
}

// TODO
export const RelayPopoverLink = (props: Props) => {
  const url = useMemo(() => new URL(props.url), [props.url])
  return (
    <TooltipRich
      content={
        <Paper elevation={2} surface='surfaceContainerLow' sx={styles.root}>
          <html.div style={styles.header}>
            <Text variant='title' size='lg'>
              {url.hostname}
            </Text>
          </html.div>
          <Divider />
          <html.div style={styles.content}></html.div>
        </Paper>
      }>
      <html.span>{props.children}</html.span>
    </TooltipRich>
  )
}

const styles = css.create({
  root: {},
  header: {
    padding: spacing.padding2,
  },
  content: {
    padding: spacing.padding2,
  },
})
