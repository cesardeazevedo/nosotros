import { TextClamped } from '@/components/elements/Content/TextClamped'
import { Button } from '@/components/ui/Button/Button'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { parseNote } from '@/hooks/parsers/parseNote'
import { userDraftsQueryOptions } from '@/hooks/query/useQueryUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useEventDecrypt } from '@/hooks/useEventDecrypt'
import { spacing } from '@/themes/spacing.stylex'
import { parse } from '@/utils/contentParser'
import { getDTag } from '@/utils/nip19'
import { useQuery } from '@tanstack/react-query'
import type { EventTemplate } from 'nostr-tools'
import { memo, useMemo } from 'react'
import { css } from 'react-strict-dom'
import { useEditorSelector } from './hooks/useEditor'

const formatDraftDate = (createdAt: number | undefined) => {
  if (!createdAt) return 'Unknown date'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(createdAt * 1000)
}

type DraftItemProps = {
  event: NostrEventDB
}

const DraftItem = memo(function DraftItem(props: DraftItemProps) {
  const { event } = props
  const editor = useEditorSelector((ctx) => ctx.editor)
  const openSection = useEditorSelector((ctx) => ctx.openSection)
  const setDraftId = useEditorSelector((ctx) => ctx.setDraftId)
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
  const parsed = useMemo(() => {
    if (!draft || !draftId) {
      return
    }
    return parseNote({
      ...draft,
      id: `draft:${draftId}`,
      pubkey: '',
      created_at: event.created_at,
      sig: '',
    })
  }, [draft, draftId, event.created_at])

  if (!draftId || !draft || parsed?.isRoot === false) {
    return null
  }

  return (
    <Paper outlined sx={styles.paper}>
      <Button
        fullWidth
        onClick={() => {
          if (!editor) return
          setDraftId(draftId)
          editor.commands.setContent(parse({ content: draft.content, tags: draft.tags }).contentSchema, false)
          openSection('drafts')
        }}
        sx={styles.item}>
        <Stack sx={styles.row} justify='space-between'>
          <TextClamped lines={5} sx={styles.content}>
            {draft.content.trim() || 'Media draft'}
          </TextClamped>
          <Text variant='label' size='md' sx={styles.date}>
            {formatDraftDate(draft.created_at || event.created_at)}
          </Text>
        </Stack>
      </Button>
    </Paper>
  )
})

export const EditorDrafts = memo(function EditorDrafts() {
  const pubkey = useCurrentPubkey()
  const draftsQuery = useQuery(userDraftsQueryOptions(pubkey))
  const entries = draftsQuery.data || []

  return (
    <Stack horizontal={false} sx={styles.root} gap={1}>
      <Text variant='title' size='md'>
        Root Drafts
      </Text>
      {entries.length === 0 ? (
        <Text size='md'>No root drafts</Text>
      ) : (
        entries.map((event) => <DraftItem key={event.id} event={event} />)
      )}
    </Stack>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding1,
  },
  item: {
    justifyContent: 'flex-start',
    height: 'auto',
    minHeight: 0,
    alignItems: 'flex-end',
    paddingBlock: spacing.padding1,
  },
  paper: {
    flexGrow: 0,
    borderStyle: 'dashed',
  },
  row: {
    width: '100%',
    alignItems: 'flex-end',
    gap: spacing.padding1,
  },
  content: {
    flexGrow: 1,
    minWidth: 0,
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
  },
  date: {
    opacity: 0.72,
    whiteSpace: 'nowrap',
  },
})
