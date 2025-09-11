import { Anchored } from '@/components/ui/Anchored/Anchored'
import { Badge } from '@/components/ui/Badge/Badge'
import { useUnseenNotificationsCount } from '@/hooks/state/useNotificationFeed'
import { useCurrentPubkey } from '@/hooks/useAuth'
import type React from 'react'
import { memo } from 'react'

type Props = {
  children: React.ReactNode
}

const NotificationBadgeInternal = memo(function NotificationBadgeInternal(props: Props & { pubkey: string }) {
  const value = useUnseenNotificationsCount(props.pubkey)
  return <Anchored content={<Badge maxValue={999} value={value} />}>{props.children}</Anchored>
})

export const NotificationBadge = memo(function NotificationBadge(props: Props) {
  const pubkey = useCurrentPubkey()
  return pubkey ? (
    <NotificationBadgeInternal pubkey={pubkey}>{props.children}</NotificationBadgeInternal>
  ) : (
    props.children
  )
})
