import { selectedLastSeenAtom, updateLastSeenAtom } from '@/atoms/lastSeen.atoms'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEvent } from '@/hooks/query/useQueryBase'
import { useNoteState } from '@/hooks/state/useNote'
import { useCurrentAccount } from '@/hooks/useAuth'
import { useEventHeadImage, useEventLastTag, useEventTag, useNevent } from '@/hooks/useEventUtils'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { fallbackEmoji } from '@/utils/utils'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconAt, IconBolt, IconHeartFilled, IconMessage, IconShare3 } from '@tabler/icons-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo, useEffect, useRef } from 'react'
import { css, html } from 'react-strict-dom'
import { LinkNEvent } from '../../elements/Links/LinkNEvent'
import { PostHeaderDate } from '../../elements/Posts/PostHeaderDate'
import { UserAvatar } from '../../elements/User/UserAvatar'
import { UserName } from '../../elements/User/UserName'
import { NotificationContent } from './NotificationContent'
import { NotificationMedia } from './NotificationMedia'

type Props = {
  event: NostrEventDB
  owner?: string
}

const formatter = new Intl.NumberFormat()

function getNotificationType(event: NostrEventDB) {
  switch (event.kind) {
    case Kind.Article:
    case Kind.Comment:
    case Kind.Text: {
      return event.metadata?.isRoot ? 'mention' : 'reply'
    }
    case Kind.Reaction: {
      return 'reaction'
    }
    case Kind.Repost: {
      return 'repost'
    }
    case Kind.ZapReceipt: {
      return 'zap'
    }
  }
}

export const NotificationItem = memo(function NotificationItem(props: Props) {
  const { event, owner } = props

  const acc = useCurrentAccount()
  const note = useNoteState(event)
  const mobile = useMobile()

  const type = getNotificationType(event)
  const related = useEventLastTag(event, 'e')
  const relatedEvent = useEvent(related)
  const relatedNevent = useNevent(relatedEvent.data)

  const linkNevent = type === 'reply' || type === 'mention' ? note.nip19 : relatedNevent

  const zapper = useEventTag(event, 'P')
  const zapAmount = event.metadata?.bolt11?.amount?.value || '0'

  const author = type === 'zap' ? zapper : event.pubkey

  const lastSeen = useAtomValue(selectedLastSeenAtom)?.notifications || 0
  const lastSeenRef = useRef<number>(lastSeen)
  const lastSeenValue = lastSeenRef.current
  const updateLastSeen = useSetAtom(updateLastSeenAtom)

  const unseen = event.created_at > lastSeenValue && lastSeenValue !== 0

  const headImage = useEventHeadImage(event)

  useEffect(() => {
    if (owner === acc?.pubkey) {
      updateLastSeen('notifications', event.created_at)
    }
  }, [owner, event])

  return (
    <Stack gap={1} sx={[styles.root, unseen && styles.root$unseen]} align='flex-start'>
      {unseen && <html.div style={styles.unseen} />}
      <Stack sx={styles.type} justify='flex-start' align='flex-start'>
        {type === 'zap' && (
          <>
            <Stack horizontal={false} align='center' sx={styles.zapIcon}>
              <IconBolt fill='currentColor' size={28} strokeWidth='1.5' />
              <Text size='lg' sx={styles.zapAmount}>
                {formatter.format(parseInt(zapAmount) / 1000)}
              </Text>
            </Stack>
          </>
        )}
        {type === 'reaction' && (
          <>
            {event.content === '❤️' ? (
              <html.span style={styles.heartIcon}>
                <IconHeartFilled />
              </html.span>
            ) : (
              <html.span style={styles.reactionIcon}>{fallbackEmoji(event.content)}</html.span>
            )}
          </>
        )}
        {type === 'reply' && (
          <html.span style={styles.messageIcon}>
            <IconMessage fill='currentColor' size={28} strokeWidth='0.1' />
          </html.span>
        )}
        {type === 'mention' && <IconAt size={28} strokeWidth='1.5' />}
        {type === 'repost' && <IconShare3 fill='currentColor' size={28} strokeWidth='1.5' />}
      </Stack>
      <Stack gap={2} justify='flex-start' align='flex-start' grow>
        <UserAvatar pubkey={event.pubkey} />
        <LinkNEvent nevent={linkNevent}>
          <ContentProvider value={{ disableLink: true }}>
            <Stack sx={styles.content} wrap grow>
              {author && <UserName pubkey={author} sx={styles.username} />}{' '}
              {type === 'zap' && (
                <>
                  <Text size='md'>zapped to your note:</Text>
                  {relatedEvent.data && <NotificationContent event={relatedEvent.data} />}
                </>
              )}
              {type === 'reaction' && (
                <>
                  <Text size='md'>reacted to your note:</Text>{' '}
                  {relatedEvent.data && <NotificationContent event={relatedEvent.data} />}
                </>
              )}
              {type === 'reply' && (
                <>
                  <Text size='md'>
                    replied to {event.pubkey === acc?.pubkey ? 'your note' : 'a note you were mentioned'}
                    {': '}
                  </Text>{' '}
                  <NotificationContent event={event} />
                </>
              )}
              {type === 'mention' && (
                <>
                  <Text size='md'>mentioned you in a note:</Text> <NotificationContent event={event} />
                </>
              )}
              {type === 'repost' && (
                <>
                  <Text size='md'>
                    reposted {event.pubkey === acc?.pubkey ? 'your note' : 'a note you were mentioned'}
                  </Text>{' '}
                  {relatedEvent.data && <NotificationContent event={relatedEvent.data} />}
                </>
              )}
              <PostHeaderDate dateStyle='long' date={event.created_at} />
            </Stack>
          </ContentProvider>
        </LinkNEvent>
      </Stack>
      {!mobile && headImage && (
        <html.div style={styles.trailing}>{note && <NotificationMedia event={event} />}</html.div>
      )}
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
    minHeight: 50,
    borderBottom: '1px solid',
    borderBottomColor: palette.outlineVariant,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.08)',
    },
  },
  root$unseen: {
    backgroundColor: palette.surfaceContainerLow,
  },
  unseen: {
    position: 'absolute',
    width: 3,
    height: 'calc(100% + 1px)', // cover divider
    backgroundColor: palette.tertiary,
    top: 0,
    left: 0,
    bottom: -2,
    zIndex: 1,
  },
  type: {
    paddingTop: spacing['padding0.5'],
    minWidth: 30,
    maxWidth: 30,
  },
  icon: {},
  zapIcon: {
    color: colors.violet7,
  },
  heartIcon: {
    color: colors.red7,
  },
  messageIcon: {
    opacity: 0.24,
  },
  reactionIcon: {
    userSelect: 'none',
    fontSize: '150%',
  },
  content: {
    display: 'inline-block',
    flex: 1,
    flexGrow: 1,
    pointerEvents: 'none',
  },
  username: {
    display: 'inline-flex',
    fontWeight: 600,
  },
  trailing: {
    minWidth: 60,
  },
  zapAmount: {
    fontFamily: 'monospace',
  },
})
