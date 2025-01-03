import { Chip } from '@/components/ui/Chip/Chip'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { RelayConnectedIcon } from './RelayConnectedIcon'

type Props = {
  url: string
  icon?: React.ReactNode
}

export const RelayChip = observer(function RelayChip(props: Props) {
  const { url, icon } = props
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
        label={<Tooltip text={url}>{formatted?.hostname}</Tooltip>}
      />
    )
  )
})
