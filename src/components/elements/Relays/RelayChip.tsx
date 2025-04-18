import { Chip } from '@/components/ui/Chip/Chip'
import { chipTokens } from '@/components/ui/Chip/Chip.stylex'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { prettyRelayUrl } from '@/core/helpers/formatRelayUrl'
import { relaysStore } from '@/stores/relays/relays.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { css } from 'react-strict-dom'
import { RelayConnectedIcon } from './RelayConnectedIcon'
import { RelayIcon } from './RelayIcon'

type Props = {
  url: string
  selected?: boolean
  icon?: React.ReactNode
  trailingIcon?: React.ReactNode
  renderDisconnectedIcon?: boolean
  onlyRelayIcon?: boolean
  onClick?: () => void
  onDelete?: () => void
}

export const RelayChip = observer(function RelayChip(props: Props) {
  const { url, icon, trailingIcon, selected, onlyRelayIcon, renderDisconnectedIcon = true, onClick, onDelete } = props
  const formatted = prettyRelayUrl(url)
  return (
    <Chip
      variant='filter'
      sx={styles.root}
      selected={selected}
      icon={icon ?? <RelayIcon onlyRelayIcon={onlyRelayIcon} size='xs' url={url} />}
      onClick={onClick}
      label={formatted?.length > 24 ? <Tooltip text={url}>{formatted}</Tooltip> : formatted}
      trailingIcon={
        trailingIcon || (!relaysStore.getByUrl(url)?.connected && !renderDisconnectedIcon) ? null : (
          <RelayConnectedIcon url={url} />
        )
      }
      onDelete={onDelete}
    />
  )
})

const styles = css.create({
  root: {
    [chipTokens.leadingSpace]: spacing['padding0.5'],
  },
})
