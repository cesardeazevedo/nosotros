import type { DevtoolsChildSubscription, DevtoolsSubscriptionGroup } from '@/atoms/devtools.atoms'
import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { memo, useMemo } from 'react'
import { css, html } from 'react-strict-dom'
import { DevToolsMiniChip } from './DevToolsMiniChip'

type Props = {
  selected: DevtoolsSubscriptionGroup | null
}

export const DevToolsSubscriptionDetails = memo(function DevToolsSubscriptionDetails(props: Props) {
  const { selected } = props
  const selectedStateLabel = selected?.state === 'open' && selected.ctx.closeOnEose === false ? 'live' : selected?.state
  const selectedStateTone = selected?.state === 'open' ? 'primary' : 'default'
  const childrenByRelay = useMemo(() => {
    if (!selected) return [] as [string, DevtoolsChildSubscription[]][]
    const grouped = new Map<string, DevtoolsChildSubscription[]>()
    selected.children.forEach((child) => {
      const current = grouped.get(child.relay) || []
      grouped.set(child.relay, [...current, child])
    })
    return [...grouped.entries()].sort((a, b) => {
      const aEvents = a[1].reduce((acc, child) => acc + child.eventCount, 0)
      const bEvents = b[1].reduce((acc, child) => acc + child.eventCount, 0)
      return bEvents - aEvents
    })
  }, [selected])

  return (
    <Stack horizontal={false} sx={styles.root}>
      <Stack justify='space-between' sx={styles.header}>
        <Text size='lg' variant='title'>
          Subscription Details
        </Text>
        {selected && (
          <DevToolsMiniChip tone={selectedStateTone} uppercase>
            {selectedStateLabel}
          </DevToolsMiniChip>
        )}
      </Stack>
      <Divider />
      <Stack horizontal={false} sx={styles.body}>
        {selected ? (
          <>
            <Stack justify='space-between' sx={styles.row}>
              <Text size='lg'>subscription_id:</Text>
              <Text size='lg' sx={styles.value}>
                {selected.ctx.subId || '-'}
              </Text>
            </Stack>
            <Stack justify='space-between' sx={styles.row}>
              <Text size='lg'>created_at:</Text>
              <Text size='lg' sx={styles.value}>
                {new Date(selected.createdAt).toLocaleTimeString()}
              </Text>
            </Stack>
            <Stack horizontal={false} sx={styles.block}>
              <Text size='lg' sx={styles.subheader}>
                filter
              </Text>
              <Stack justify='space-between' sx={styles.row}>
                <Text size='lg'>kinds:</Text>
                <Text size='lg' sx={styles.value}>
                  {selected.filter.kinds?.join(', ') || '-'}
                </Text>
              </Stack>
              <Stack justify='space-between' sx={styles.row}>
                <Text size='lg'>authors:</Text>
                {selected.filter.authors?.length ? (
                  <UsersAvatars pubkeys={selected.filter.authors} max={4} />
                ) : (
                  <Text size='lg' sx={styles.value}>
                    -
                  </Text>
                )}
              </Stack>
              {!!selected.filter.ids && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>ids:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.filter.ids}
                  </Text>
                </Stack>
              )}
              {!!selected.filter.p && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>#p:</Text>
                  {selected.filter.p?.length ? (
                    <UsersAvatars pubkeys={selected.filter.p} max={4} />
                  ) : (
                    <Text size='lg' sx={styles.value}>
                      -
                    </Text>
                  )}
                </Stack>
              )}
              {!!selected.filter.e && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>#e:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.filter.e}
                  </Text>
                </Stack>
              )}
              {!!selected.filter.a && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>#a:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.filter.a}
                  </Text>
                </Stack>
              )}
              {!!selected.filter.d && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>#d:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.filter.d}
                  </Text>
                </Stack>
              )}
              {!!selected.filter.t && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>#t:</Text>
                  <Text size='lg' sx={styles.value}>
                    {JSON.stringify(selected.filter.t)}
                  </Text>
                </Stack>
              )}
              {!!selected.filter.k && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>#k:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.filter.k}
                  </Text>
                </Stack>
              )}
              {!!selected.filter.q && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>#q:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.filter.q}
                  </Text>
                </Stack>
              )}
              {!!selected.filter.limit && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>limit:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.filter.limit}
                  </Text>
                </Stack>
              )}
              {!!selected.filter.since && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>since:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.filter.since}
                  </Text>
                </Stack>
              )}
              {!!selected.filter.until && (
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>until:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.filter.until}
                  </Text>
                </Stack>
              )}
            </Stack>
            {selected.ctx.network !== 'LIVE' && (
              <Stack horizontal={false} sx={styles.block}>
                <Text size='lg' sx={styles.subheader}>
                  cache
                </Text>
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>strategy:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.ctx.network || '-'}
                  </Text>
                </Stack>
                <Stack justify='space-between' sx={styles.row}>
                  <Text size='lg'>sqlite events:</Text>
                  <Text size='lg' sx={styles.value}>
                    {selected.cacheQueriedEvents}
                  </Text>
                </Stack>
              </Stack>
            )}
            <Stack horizontal={false} sx={styles.block}>
              <Text size='lg' sx={styles.subheader}>
                Relays ({childrenByRelay.length})
              </Text>
              {childrenByRelay.map(([relay, children]) => {
                const relayState = children.some((child) => child.state === 'open') ? 'open' : 'closed'
                const relayEvents = children.reduce((acc, child) => acc + child.eventCount, 0)
                const showNegInHeader = children.length === 1 && children[0]?.isNegentropy
                const showNegErrorInHeader = children.length === 1 && !!children[0]?.negErrorMessage
                const isRelayFullySynced =
                  relayEvents === 0 &&
                  children.some(
                    (child) => child.isNegentropy && child.localEventsSelected > 0 && child.negMissingIds === 0,
                  )
                return (
                  <Stack key={relay} horizontal={false} sx={styles.expandable}>
                    <Expandable
                      initiallyExpanded={false}
                      trigger={({ expanded }) => (
                        <Stack justify='space-between' sx={styles.expandableHeader}>
                          <Stack gap={0.5}>
                            <html.span style={styles.chevron}>
                              {expanded ? <IconChevronDown size={24} /> : <IconChevronRight size={24} />}
                            </html.span>
                            <RelayChip disablePopover url={relay} />
                            <DevToolsMiniChip>{relayEvents} events</DevToolsMiniChip>
                            {isRelayFullySynced && <DevToolsMiniChip tone='primary'>full synced</DevToolsMiniChip>}
                          </Stack>
                          <Stack gap={0.5}>
                            {showNegErrorInHeader ? (
                              <DevToolsMiniChip tone='danger' uppercase>
                                NEG ERROR
                              </DevToolsMiniChip>
                            ) : showNegInHeader ? (
                              <DevToolsMiniChip tone='primary' uppercase>
                                NEG
                              </DevToolsMiniChip>
                            ) : null}
                            <DevToolsMiniChip>
                              {children.length} {children.length === 1 ? 'SUB' : 'SUBS'}
                            </DevToolsMiniChip>
                            <DevToolsMiniChip tone={relayState === 'closed' ? 'default' : 'primary'} uppercase>
                              {relayState}
                            </DevToolsMiniChip>
                          </Stack>
                        </Stack>
                      )}>
                      {children.map((child) => (
                        <Stack key={child.id} horizontal={false} sx={styles.child}>
                          <Paper outlined sx={children.length > 1 ? styles.childPaper : undefined}>
                            <Stack horizontal={false} gap={0.5} sx={styles.expandableItem}>
                              <Stack justify='space-between' sx={styles.row}>
                                <Text size='lg'>sub_id:</Text>
                                <Stack gap={0.5}>
                                  {!showNegInHeader &&
                                    (child.negErrorMessage ? (
                                      <DevToolsMiniChip tone='danger' uppercase>
                                        NEG ERROR
                                      </DevToolsMiniChip>
                                    ) : child.isNegentropy ? (
                                      <DevToolsMiniChip tone='primary' uppercase>
                                        NEG
                                      </DevToolsMiniChip>
                                    ) : null)}
                                  <Text size='lg' sx={styles.subId}>
                                    {child.subscriptionId}
                                  </Text>
                                </Stack>
                              </Stack>
                              {children.length > 1 && (
                                <Stack justify='space-between' sx={styles.row}>
                                  <Text size='lg'>state:</Text>
                                  <DevToolsMiniChip tone={child.state === 'closed' ? 'default' : 'primary'} uppercase>
                                    {child.state}
                                  </DevToolsMiniChip>
                                </Stack>
                              )}
                              {child.negErrorMessage ? (
                                <Stack justify='space-between' sx={styles.row}>
                                  <Text size='lg'>neg msg:</Text>
                                  <Text size='lg' sx={styles.value}>
                                    {child.negErrorMessage}
                                  </Text>
                                </Stack>
                              ) : child.isNegentropy ? (
                                <>
                                  <Stack justify='space-between' sx={styles.row}>
                                    <Text size='lg'>neg storage:</Text>
                                    <Text size='lg' sx={styles.value}>
                                      {child.localEventsSelected}
                                    </Text>
                                  </Stack>
                                  <Stack justify='space-between' sx={styles.row}>
                                    <Text size='lg'>neg missing ids:</Text>
                                    <Text size='lg' sx={styles.value}>
                                      {child.negMissingIds}
                                    </Text>
                                  </Stack>
                                </>
                              ) : null}
                              <Stack justify='space-between' sx={styles.row}>
                                <Text size='lg'>authors:</Text>
                                {child.filter.authors?.length ? (
                                  <UsersAvatars pubkeys={child.filter.authors} max={4} />
                                ) : (
                                  <Text size='lg' sx={styles.value}>
                                    -
                                  </Text>
                                )}
                              </Stack>
                              {!!child.filter.ids && (
                                <Stack justify='space-between' sx={styles.row}>
                                  <Text size='lg'>ids:</Text>
                                  <Text size='lg' sx={styles.value}>
                                    {child.filter.ids}
                                  </Text>
                                </Stack>
                              )}
                              {!!child.filter.p && (
                                <Stack justify='space-between' sx={styles.row}>
                                  <Text size='lg'>#p:</Text>
                                  {child.filter.p?.length ? (
                                    <UsersAvatars pubkeys={child.filter.p} max={4} />
                                  ) : (
                                    <Text size='lg' sx={styles.value}>
                                      -
                                    </Text>
                                  )}
                                </Stack>
                              )}
                              {!!child.filter.e && (
                                <Stack justify='space-between' sx={styles.row}>
                                  <Text size='lg'>#e:</Text>
                                  <Text size='lg' sx={styles.value}>
                                    {child.filter.e}
                                  </Text>
                                </Stack>
                              )}
                              {!!child.filter.a && (
                                <Stack justify='space-between' sx={styles.row}>
                                  <Text size='lg'>#a:</Text>
                                  <Text size='lg' sx={styles.value}>
                                    {child.filter.a}
                                  </Text>
                                </Stack>
                              )}
                              {!!child.filter.d && (
                                <Stack justify='space-between' sx={styles.row}>
                                  <Text size='lg'>#d:</Text>
                                  <Text size='lg' sx={styles.value}>
                                    {child.filter.d}
                                  </Text>
                                </Stack>
                              )}
                              {!!child.filter.t && (
                                <Stack justify='space-between' sx={styles.row}>
                                  <Text size='lg'>#t:</Text>
                                  <Text size='lg' sx={styles.value}>
                                    {JSON.stringify(child.filter.t)}
                                  </Text>
                                </Stack>
                              )}
                              {!!child.filter.k && (
                                <Stack justify='space-between' sx={styles.row}>
                                  <Text size='lg'>#k:</Text>
                                  <Text size='lg' sx={styles.value}>
                                    {child.filter.k}
                                  </Text>
                                </Stack>
                              )}
                              {!!child.filter.q && (
                                <Stack justify='space-between' sx={styles.row}>
                                  <Text size='lg'>#q:</Text>
                                  <Text size='lg' sx={styles.value}>
                                    {child.filter.q}
                                  </Text>
                                </Stack>
                              )}
                              <Stack sx={styles.eventsGroup}>
                                <Text size='lg'>events:</Text>
                                <html.div style={styles.kindWrapOuter}>
                                  <Stack wrap gap={0.5} sx={styles.kindWrap}>
                                    <DevToolsMiniChip>total {child.eventCount}</DevToolsMiniChip>
                                    {Object.keys(child.eventsByKind)
                                      .map((kind) => Number(kind))
                                      .sort((a, b) => a - b)
                                      .map((kind) => (
                                        <html.span key={`${child.id}-k-${kind}`} style={styles.kindChip}>
                                          <html.span style={styles.kindCount}>{child.eventsByKind[kind]}</html.span>
                                          <html.span>{`kind ${kind}`}</html.span>
                                        </html.span>
                                      ))}
                                  </Stack>
                                </html.div>
                              </Stack>
                            </Stack>
                          </Paper>
                        </Stack>
                      ))}
                    </Expandable>
                  </Stack>
                )
              })}
            </Stack>
            <Stack horizontal={false} sx={styles.block}>
              <Text size='lg' sx={styles.subheader}>
                query_key
              </Text>
              <Text size='lg' sx={styles.raw}>
                {selected.ctx.queryKey ? JSON.stringify(selected.ctx.queryKey, null, 2) : '-'}
              </Text>
            </Stack>
          </>
        ) : (
          <Text size='lg'>No subscriptions yet.</Text>
        )}
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    alignSelf: 'stretch',
    borderLeft: '1px solid',
    borderLeftColor: palette.outlineVariant,
  },
  header: {
    alignItems: 'center',
    padding: spacing.padding2,
  },
  body: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    overflow: 'auto',
    alignSelf: 'stretch',
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.lg,
    margin: spacing.padding2,
    padding: spacing.padding2,
  },
  row: {
    width: '100%',
    alignItems: 'center',
  },
  value: {
    textAlign: 'right',
    maxWidth: '70%',
  },
  subId: {
    textAlign: 'right',
    maxWidth: '70%',
    whiteSpace: 'nowrap',
  },
  block: {
    width: '100%',
    marginTop: spacing.margin1,
    paddingTop: spacing.padding1,
    paddingBottom: spacing.padding1,
    backgroundColor: palette.surfaceContainerLow,
    borderRadius: shape.sm,
    paddingInline: spacing.padding1,
  },
  subheader: {
    fontWeight: 700,
    marginBottom: spacing.margin1,
  },
  raw: {
    width: '100%',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  eventsGroup: {
    width: '100%',
    alignItems: 'center',
    gap: spacing['padding0.5'],
  },
  kindWrapOuter: {
    marginInlineStart: 'auto',
    marginInlineEnd: 0,
    marginBlock: 0,
    display: 'inline-block',
  },
  kindWrap: {
    padding: spacing.padding1,
    paddingRight: 0,
    alignItems: 'center',
  },
  kindChip: {
    border: '1px solid',
    borderColor: palette.outline,
    color: palette.onSurfaceVariant,
    borderRadius: 999,
    paddingInline: spacing.padding1,
    paddingBlock: 2,
    fontSize: 12,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing['padding0.5'],
  },
  kindCount: {
    borderRadius: shape.full,
    backgroundColor: palette.surfaceContainerHigh,
    color: palette.onSurface,
    minWidth: 18,
    height: 18,
    paddingInline: 5,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 800,
  },
  expandable: {
    width: '100%',
    border: '1px solid',
    borderColor: palette.outlineVariant,
    borderRadius: shape.lg,
    marginBottom: spacing.margin1,
    backgroundColor: palette.surfaceContainerLowest,
  },
  expandableHeader: {
    width: '100%',
    paddingInline: spacing.padding1,
    paddingBlock: spacing.padding1,
    cursor: 'pointer',
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginInlineEnd: spacing.margin1,
  },
  expandableItem: {
    width: '100%',
    paddingInline: spacing.padding2,
    paddingBottom: spacing.padding1,
  },
  child: {
    marginInline: spacing.margin1,
    marginBlock: spacing.margin1,
  },
  childPaper: {
    paddingTop: spacing.padding1,
    paddingBottom: spacing.padding1,
  },
})
