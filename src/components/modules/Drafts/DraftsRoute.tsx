import { RouteContainer } from '@/components/elements/Layouts/RouteContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { ReplyHeaderInner } from '@/components/elements/Replies/ReplyHeader'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { parseNote } from '@/hooks/parsers/parseNote'
import { useEvent } from '@/hooks/query/useQueryBase'
import { userDraftsQueryOptions } from '@/hooks/query/useQueryUser'
import { useUserState } from '@/hooks/state/useUser'
import { useCurrentPubkey, useCurrentSigner } from '@/hooks/useAuth'
import { useEventDecrypt } from '@/hooks/useEventDecrypt'
import { useEventTag, useNevent } from '@/hooks/useEventUtils'
import { useResetScroll } from '@/hooks/useResetScroll'
import { publishDraftDelete } from '@/nostr/publish/publishDraftEvent'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { getDTag } from '@/utils/nip19'
import { IconFeatherFilled, IconLock, IconTrash } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { EventTemplate } from 'nostr-tools'
import { memo, useMemo } from 'react'
import { css, html } from 'react-strict-dom'

type DraftCardProps = {
  event: NostrEventDB
}

const DraftCard = memo(function DraftCard(props: DraftCardProps) {
  const { event } = props
  const pubkey = useCurrentPubkey()
  const signer = useCurrentSigner()
  const navigate = useNavigate()
  const draftId = getDTag(event)
  const [, decryptedContent] = useEventDecrypt(event)
  const draft = useMemo(() => {
    if (!decryptedContent) {
      return null
    }
    try {
      const parsed = JSON.parse(decryptedContent) as EventTemplate
      if (typeof parsed?.kind !== 'number' || typeof parsed?.content !== 'string' || !Array.isArray(parsed?.tags)) {
        return null
      }
      return parsed
    } catch {
      return null
    }
  }, [decryptedContent])

  const parsed = useMemo(
    () => {
      if (!draft) {
        return
      }
      return parseNote({
        ...draft,
        id: `draft:${draftId}`,
        pubkey: pubkey || '',
        created_at: event.created_at,
        sig: '',
      })
    },
    [draft, draftId, event.created_at, pubkey],
  )

  const parentId = parsed?.parentId || parsed?.rootId
  const parent = useEvent(parentId || '', undefined)
  const parentUser = useUserState(parent.data?.pubkey)
  const nevent = useNevent(parent.data)
  const isReplyDraft = parsed?.isRoot === false && !!parentId

  if (!draftId || !draft || !parsed) {
    return null
  }

  const search = isReplyDraft
    ? nevent
      ? ({ replying: nevent, n: draftId } as const)
      : undefined
    : ({ compose: true, n: draftId } as const)

  const dTag = useEventTag(event, 'd')

  const card = (
    <Paper
      outlined
      surface='surfaceContainerLowest'
      sx={styles.card}
      onClick={() => {
        if (search) {
          navigate({ to: '.', search: (current) => ({ ...current, ...search }) })
        }
      }}>
      <Stack horizontal={false} gap={0.5}>
        <Stack sx={styles.metaHeader} align='center' justify='space-between'>
          <Stack gap={1} align='center'>
            <html.span style={styles.warningIcon}>
              <IconLock size={18} />
            </html.span>
            <Text variant='label' size='lg'>
              Encrypted Draft {dTag}
            </Text>
          </Stack>
          <IconButton
            onClick={(clickEvent) => {
              clickEvent.stopPropagation()
              if (!pubkey || !signer) {
                return
              }
              publishDraftDelete(pubkey, event, { signer })
            }}
            icon={<IconTrash size={18} />}
          />
        </Stack>
        {pubkey && (
          <Stack sx={styles.userHeader}>
            <UserHeader pubkey={pubkey} renderNIP05={false} />
          </Stack>
        )}
        {isReplyDraft && parent.data && <ReplyHeaderInner parentUser={parentUser} nevent={nevent} dense />}
        <Stack horizontal={false} gap={0.5} sx={styles.body}>
          <Text size='lg' sx={styles.content}>
            {draft.content || 'Media draft'}
          </Text>
        </Stack>
      </Stack>
    </Paper>
  )

  return <Stack horizontal={false} gap={1}>{card}</Stack>
})

export const DraftsRoute = memo(function DraftsRoute() {
  useResetScroll()
  const pubkey = useCurrentPubkey()
  const signer = useCurrentSigner()
  const draftsQuery = useQuery(userDraftsQueryOptions(pubkey))
  const items = draftsQuery.data || []

  return (
    <RouteContainer
      header={
        <Stack sx={styles.header} gap={1}>
          <IconFeatherFilled size={24} />
          <Text variant='title' size='lg'>
            Drafts
          </Text>
          <Stack grow />
          <Button
            variant='danger'
            onClick={() => {
              if (!pubkey || !signer) {
                return
              }
              Promise.all(
                items
                  .map((item) => (getDTag(item) ? publishDraftDelete(pubkey, item, { signer }) : undefined))
                  .filter((task) => !!task),
              )
            }}>
            Delete all drafts
          </Button>
        </Stack>
      }>
      <Stack horizontal={false} gap={1} sx={styles.root}>
        {items.length === 0 && draftsQuery.isLoading ? (
          <PostLoading rows={3} />
        ) : items.length === 0 ? (
          <Text size='lg' sx={styles.empty}>
            No drafts yet.
          </Text>
        ) : (
          items.map((draftEvent) => <DraftCard key={draftEvent.id} event={draftEvent} />)
        )}
      </Stack>
    </RouteContainer>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding1,
  },
  header: {
    padding: spacing.padding1,
    paddingLeft: spacing.padding2,
  },
  card: {
    width: '100%',
    padding: 0,
    overflow: 'hidden',
    borderStyle: 'dashed',
    borderWidth: 2,
    cursor: 'pointer',
  },
  metaHeader: {
    backgroundColor: palette.surfaceContainerLow,
    padding: spacing.padding1,
    paddingLeft: spacing.padding2,
  },
  warningIcon: {
    color: palette.warning,
  },
  userHeader: {
    paddingTop: spacing.padding1,
    paddingInline: spacing.padding1,
  },
  body: {
    paddingInline: spacing.padding1,
    paddingBottom: spacing.padding1,
  },
  content: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  empty: {
    padding: spacing.padding1,
  },
})
