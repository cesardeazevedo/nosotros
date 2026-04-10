import { PostHeader } from '@/components/elements/Posts/PostHeader'
import { EventProvider } from '@/components/providers/NoteProvider'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind, KIND_LABELS } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventDecryptedTags } from '@/hooks/useEventDecrypt'
import { queryKeys } from '@/hooks/query/queryKeys'
import { replaceableEventQueryOptions } from '@/hooks/query/useQueryBase'
import { useCurrentPubkey, useCurrentSigner } from '@/hooks/useAuth'
import { publishEmojiList } from '@/nostr/publish/publishEmojiList'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { memo, useMemo } from 'react'
import { useObservableState } from 'observable-hooks'
import { css, html } from 'react-strict-dom'
import { catchError, EMPTY, map, mergeMap, of, startWith, tap } from 'rxjs'

type Props = {
  event: NostrEventDB
}

type EmojiTagItem = {
  name: string
  url?: string
}

export const ListEmojiSetsRoot = memo(function ListEmojiSetsRoot(props: Props) {
  const { event } = props
  const pubkey = useCurrentPubkey()
  const signer = useCurrentSigner()
  const queryClient = useQueryClient()
  const decryptedTags = useEventDecryptedTags(event)
  const installedQuery = useQuery(
    replaceableEventQueryOptions(Kind.Emojis, pubkey || '', {
      enabled: !!pubkey,
      ctx: {
        outbox: true,
        negentropy: false,
      },
    }),
  )
  const title = event.tags.find((tag) => tag[0] === 'title')?.[1]
  const description = event.tags.find((tag) => tag[0] === 'description')?.[1]
  const dTag = event.tags.find((tag) => tag[0] === 'd')?.[1]
  const label = title || dTag || '-'
  const displayKind = KIND_LABELS[event.kind] ? `${KIND_LABELS[event.kind]} (${event.kind})` : `Kind ${event.kind}`

  const emojis = useMemo(() => {
    const entries = new Map<string, EmojiTagItem>()
    const publicTags = event.tags.filter((tag) => tag[0] === 'emoji')
    const privateTags = (decryptedTags || []).filter((tag) => tag[0] === 'emoji')

    for (const [, name, url] of [...publicTags, ...privateTags]) {
      if (name) {
        entries.set(name, { name, url })
      }
    }

    return [...entries.values()]
  }, [decryptedTags, event.tags])

  const address = useMemo(
    () => (dTag ? [event.kind, event.pubkey, dTag].join(':') : undefined),
    [dTag, event.kind, event.pubkey],
  )
  const installed = !!address && !!installedQuery.data?.tags.some((tag) => tag[0] === 'a' && tag[1] === address)

  const [installing, onInstall] = useObservableState<boolean, void>((input$) => {
    return input$.pipe(
      mergeMap(() => {
        if (!pubkey || !signer || !address) {
          return EMPTY
        }
        return publishEmojiList(pubkey, address, { signer }).pipe(
          tap(() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.replaceable(Kind.Emojis, pubkey) })
          }),
          map(() => false),
          startWith(true),
          catchError(() => of(false)),
        )
      }),
    )
  }, false)

  return (
    <EventProvider value={{ event }}>
      {/* <PostHeader event={event} /> */}
      <Stack sx={styles.header} justify='space-between'>
        <Stack horizontal={false} gap={0.5} sx={styles.headerContent}>
          <Text variant='headline' size='md'>
            {displayKind}
          </Text>
          <Text variant='title' size='md'>
            {label}
          </Text>
          {description && (
            <Text variant='body' size='sm' sx={styles.description}>
              {description}
            </Text>
          )}
        </Stack>
        <Stack gap={1}>
          <Button
            variant='filledTonal'
            disabled={!pubkey || !signer || !address || installing}
            onClick={() => onInstall()}>
            {installed ? 'Uninstall Emoji Set' : 'Install Emoji Set'}
          </Button>
        </Stack>
      </Stack>
      <Divider />
      <Stack sx={styles.content} gap={1} align='center'>
        {emojis.map((emoji) => (
          <Stack key={emoji.name} horizontal={false} gap={0.5} align='center' sx={styles.emoji}>
            {emoji.url ? (
              <html.img alt={emoji.name} src={emoji.url} style={styles.emojiImage} />
            ) : (
              <Text variant='headline' size='md'>
                :{emoji.name}:
              </Text>
            )}
            <Text variant='label' size='sm' sx={styles.emojiLabel}>
              :{emoji.name}:
            </Text>
          </Stack>
        ))}
        {emojis.length === 0 && (
          <Text variant='body' size='sm' sx={styles.empty}>
            No emojis
          </Text>
        )}
      </Stack>
    </EventProvider>
  )
})

const styles = css.create({
  header: {
    paddingInline: spacing.padding3,
    paddingBlock: spacing.padding2,
    flexWrap: 'wrap',
    rowGap: spacing.padding1,
  },
  headerContent: {
    minWidth: 0,
    flex: 1,
  },
  description: {
    color: palette.onSurfaceVariant,
  },
  content: {
    flexWrap: 'wrap',
    padding: spacing.padding2,
    alignItems: 'flex-start',
  },
  emoji: {
    minWidth: 72,
    padding: spacing.padding1,
  },
  emojiImage: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  emojiLabel: {
    color: palette.onSurfaceVariant,
  },
  empty: {
    color: palette.onSurfaceVariant,
  },
})
