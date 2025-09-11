import { Paper } from '@/components/ui/Paper/Paper'
import { TooltipRich } from '@/components/ui/TooltipRich/TooltipRich'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { RelayHeader } from './RelayHeader'

type Props = {
  url: string
  disabled?: boolean
  openEvent?: 'click' | 'hover'
  children: React.ReactNode
}

const PopoverContent = memo(function PopoverContent(props: { url: string }) {
  const { url } = props

  return (
    <Paper elevation={2} surface='surfaceContainerLow' sx={styles.root}>
      <RelayHeader url={url} />
    </Paper>
  )
})

export const RelayPopover = memo(function RelayPopoverLink(props: Props) {
  const { openEvent = 'hover', disabled = false } = props
  if (disabled) {
    return props.children
  }
  const url = formatRelayUrl(props.url)
  return (
    <TooltipRich
      openEvents={{ click: openEvent === 'click', hover: openEvent === 'hover', focus: false, touch: false }}
      cursor='dot'
      content={() => <PopoverContent url={url} />}
      placement='bottom-start'>
      {props.children}
    </TooltipRich>
  )
})

const styles = css.create({
  root: {
    minWidth: 340,
    maxHeight: 400,
  },
})
