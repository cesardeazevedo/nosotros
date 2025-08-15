import { Chip } from '@/components/ui/Chip/Chip'
import React, { memo, useMemo } from 'react'
import { RelayConnectedIcon } from './RelayConnectedIcon'

type Props = {
  url: string
  icon?: React.ReactNode
  onDelete?: () => void
}

export const RelayInputChip = memo(function RelayInputChip(props: Props) {
  const { url, icon, onDelete } = props
  const formatted = useMemo(() => new URL(url), [url])
  return (
    <Chip
      variant='input'
      icon={icon || <RelayConnectedIcon url={url} />}
      label={formatted.hostname}
      onDelete={onDelete}
    />
  )
})
