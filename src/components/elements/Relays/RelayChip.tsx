import { Chip } from '@/components/ui/Chip/Chip'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { RelayConnectedIcon } from './RelayConnectedIcon'

type Props = {
  url: string
  icon?: React.ReactNode
  onClick?: () => void
}

export const RelayChip = observer(function RelayChip(props: Props) {
  const { url, icon, onClick } = props
  const formatted = useMemo(() => {
    try {
      return new URL(url)
    } catch (error) {
      console.log('error url', error)
    }
  }, [url])
  return (
    formatted && (
      <Chip
        icon={icon || <RelayConnectedIcon url={url} />}
        onClick={onClick}
        label={
          formatted?.hostname.length > 24 ? <Tooltip text={url}>{formatted?.hostname}</Tooltip> : formatted.hostname
        }
      />
    )
  )
})
