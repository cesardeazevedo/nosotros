import { Chip } from '@/components/ui/Chip/Chip'
import { chipTokens } from '@/components/ui/Chip/Chip.stylex'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { prettyRelayUrl } from '@/core/helpers/formatRelayUrl'
import { useRelay } from '@/hooks/useRelays'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { RelayConnectedIcon } from './RelayConnectedIcon'
import { RelayIcon } from './RelayIcon'
import { RelayPopover } from './RelayPopover'

type Props = {
  url: string
  selected?: boolean
  icon?: React.ReactNode
  trailingIcon?: React.ReactNode
  renderDisconnectedIcon?: boolean
  onlyRelayIcon?: boolean
  disablePopover?: boolean
  onClick?: (e: StrictClickEvent) => void
  onDelete?: () => void
}

export const RelayChip = memo(function RelayChip(props: Props) {
  const {
    url,
    icon,
    trailingIcon,
    selected,
    onlyRelayIcon,
    renderDisconnectedIcon = true,
    onClick,
    onDelete,
    disablePopover,
  } = props
  const formatted = prettyRelayUrl(url)
  const relay = useRelay(url)
  return (
    <RelayPopover openEvent='click' url={url} disabled={disablePopover}>
      <Chip
        variant='filter'
        sx={styles.root}
        selected={selected}
        icon={icon ?? <RelayIcon onlyRelayIcon={onlyRelayIcon} size='xs' url={url} />}
        onClick={onClick}
        label={formatted?.length > 24 ? <Tooltip text={url}>{formatted}</Tooltip> : formatted}
        trailingIcon={
          trailingIcon || (!relay?.connected && !renderDisconnectedIcon) ? null : <RelayConnectedIcon url={url} />
        }
        onDelete={onDelete}
      />
    </RelayPopover>
  )
})

const styles = css.create({
  root: {
    [chipTokens.leadingSpace]: spacing['padding0.5'],
  },
})
