import { eventNip19Atom, publishesByIdAtom, publishFailuresAtom, publishSuccessesAtom } from '@/atoms/publish.atoms'
import { dequeueToastAtom } from '@/atoms/toaster.atoms'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight, IconX } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import type { NostrEvent } from 'nostr-tools'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'
import { RelayChip } from '../Relays/RelayChip'
import { RelayPublishIcon } from '../Relays/RelayPublishIcon'

type Props = {
  event: NostrEvent
  eventLabel?: string
  actionLabel?: string
  renderEventLink?: boolean
  initiallyExpanded?: boolean
}

export const ToastEventPublished = memo(function ToastEventPublished(props: Props) {
  const {
    event,
    eventLabel = 'Event',
    actionLabel = 'published',
    initiallyExpanded = false,
    renderEventLink = true,
  } = props
  const dequeueToast = useSetAtom(dequeueToastAtom)
  const publishes = useAtomValue(publishesByIdAtom(event.id))
  const successes = useAtomValue(publishSuccessesAtom(event.id))
  const failures = useAtomValue(publishFailuresAtom(event.id))
  const link = useAtomValue(eventNip19Atom(event))
  return (
    <Stack horizontal={false} align='stretch' sx={styles.root}>
      <Stack gap={0.5} sx={styles.header} justify='space-between'>
        <html.div style={styles.title}>
          <Text variant='body' size='lg' sx={styles.title}>
            {eventLabel} {actionLabel}
          </Text>
        </html.div>
        <IconButton onClick={() => dequeueToast()}>
          <IconX size={20} />
        </IconButton>
      </Stack>
      <Stack grow sx={styles.header} align='stretch'>
        {renderEventLink && (
          <Link to='/$nostr' params={{ nostr: link! }} className={css.props(styles.link).className}>
            <Button fullWidth variant='filledTonal'>
              See {eventLabel}
            </Button>
          </Link>
        )}
      </Stack>
      <Divider />
      <Expandable
        initiallyExpanded={initiallyExpanded}
        trigger={({ expand, expanded }) => (
          <Stack gap={0.5} sx={styles.header} justify='space-between'>
            <IconButton onClick={() => expand(!expanded)}>
              {expanded ? <IconChevronDown /> : <IconChevronRight />}
            </IconButton>
            <html.div style={styles.title}>
              <Text variant='label' size='lg' sx={styles.title}>
                {successes.length !== publishes.length
                  ? `Broadcasted to (${successes.length}/${publishes.length}) relays`
                  : `Broadcasted to ${publishes.length} relays`}
              </Text>
            </html.div>
          </Stack>
        )}>
        <Divider />
        <Stack sx={styles.content} align='flex-start' horizontal={false} gap={1}>
          <Stack horizontal={false} gap={0.5} justify='flex-start' align='flex-start'>
            {publishes.map((published) => (
              <RelayChip
                key={published.relay}
                url={published.relay}
                trailingIcon={<RelayPublishIcon published={published} />}
              />
            ))}
          </Stack>
        </Stack>
      </Expandable>
      {failures.length !== 0 && (
        <>
          <Divider />
          <Expandable
            initiallyExpanded={initiallyExpanded}
            trigger={({ expand, expanded }) => (
              <Stack gap={0.5} sx={styles.header} justify='space-between'>
                <IconButton onClick={() => expand(!expanded)}>
                  {expanded ? <IconChevronDown /> : <IconChevronRight />}
                </IconButton>
                <html.div style={styles.title}>
                  <Text variant='label' size='lg' sx={styles.error}>
                    Errors ({failures.length})
                  </Text>
                </html.div>
              </Stack>
            )}>
            <>
              <Divider />
              <Stack sx={styles.content} wrap horizontal={false} gap={0.5} justify='flex-start' align='flex-start'>
                <Text>Errors</Text>
                {failures.map((published) => (
                  <html.span key={published.relay} style={styles.errorRow}>
                    {published.relay}:<br /> {published.msg}
                  </html.span>
                ))}
              </Stack>
            </>
          </Expandable>
        </>
      )}
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: 290,
  },
  header: {
    padding: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  title: {
    flex: 1,
    flexGrow: 1,
  },
  error: {
    color: palette.error,
  },
  errorRow: {
    whiteSpace: 'pre-wrap',
  },
  content: {
    padding: spacing.padding1,
    maxHeight: 250,
    overflowY: 'auto',
  },
  link: {
    width: '100%',
  },
})
