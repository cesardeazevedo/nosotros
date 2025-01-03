import { Chip } from '@/components/ui/Chip/Chip'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { RelayConnectedIcon } from './RelayConnectedIcon'
import { seenStore } from '@/stores/seen/seen.store'

type Props = {
  url: string
  eventId?: string
  icon?: React.ReactNode
  renderConnectedIcon?: boolean
  onDelete?: () => void
}

export const RelayInputChip = observer(function RelayUserChip(props: Props) {
  const { url, eventId, icon, onDelete, renderConnectedIcon } = props
  const formatted = useMemo(() => new URL(url), [url])
  const seens = seenStore.get(eventId)
  const seen = seens.indexOf(url) > -1
  const Icon = renderConnectedIcon ? <RelayConnectedIcon url={url} /> : icon
  return <Chip selected={seen} variant='input' icon={Icon} label={formatted.hostname} onDelete={onDelete} />
})
