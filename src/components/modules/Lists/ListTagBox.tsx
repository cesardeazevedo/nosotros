import { Button } from '@/components/ui/Button/Button'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Divider } from '@/components/ui/Divider/Divider'
import { ListItem } from '@/components/ui/ListItem/ListItem'
import { Paper } from '@/components/ui/Paper/Paper'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { IconChevronDown, IconPlus, IconX } from '@tabler/icons-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { OnKeyDownRef } from '../Search/SearchContent'
import { SearchContent } from '../Search/SearchContent'

type Props = {
  event?: NostrEventDB
  initialTags?: string[][]
}

type TagOption = { label: string; value: string }

type TagRow = {
  id: string
  tagType: string
  tagTypeInput: string
  searchQuery: string
  initialValue: string
  initialRelay: string
  userOpen: boolean
}

const TAG_OPTIONS: TagOption[] = [
  { label: 'User (p tag)', value: 'p' },
  { label: 'Event (e tag)', value: 'e' },
  { label: 'Hashtag (t tag)', value: 't' },
  { label: 'Address (a tag)', value: 'a' },
  { label: 'Identifier (d tag)', value: 'd' },
  { label: 'Title (title tag)', value: 'title' },
  { label: 'Image (image tag)', value: 'image' },
  { label: 'Alt (alt tag)', value: 'alt' },
  { label: 'Relay (relay tag)', value: 'relay' },
  { label: 'Word (word tag)', value: 'word' },
  { label: 'Emoji (emoji tag)', value: 'emoji' },
  { label: 'Group (group tag)', value: 'group' },
]

export const ListTagBox = (props: Props) => {
  const { event, initialTags } = props
  const [tagTypeOpenId, setTagTypeOpenId] = useState<string | null>(null)
  const rowIdRef = useRef(0)

  const resolvedInitialTags = useMemo(() => {
    if (initialTags) return initialTags
    return event?.tags.filter(([name]) => name !== 'title' && name !== 'description' && name !== 'd') || []
  }, [event?.tags, initialTags])

  const userSearchRefs = useRef<Record<string, OnKeyDownRef | null>>({})
  const tagTypeRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const tagValueRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const createRowId = () => `row-${rowIdRef.current++}`
  const createEmptyRow = (): TagRow => ({
    id: createRowId(),
    tagType: 'p',
    tagTypeInput: 'p',
    searchQuery: '',
    initialValue: '',
    initialRelay: '',
    userOpen: false,
  })

  const [rows, setRows] = useState<TagRow[]>(() => {
    if (!resolvedInitialTags.length) return []
    return resolvedInitialTags.map(([tag, value, relay]) => {
      const match = TAG_OPTIONS.find((option) => option.value === tag)
      return {
        id: createRowId(),
        tagType: match ? tag : 'custom',
        tagTypeInput: tag,
        searchQuery: value ?? '',
        initialValue: value ?? '',
        initialRelay: relay ?? '',
        userOpen: false,
      }
    })
  })

  useEffect(() => {
    if (!resolvedInitialTags.length) {
      setRows([])
      return
    }
    setRows(
      resolvedInitialTags.map(([tag, value, relay]) => {
        const match = TAG_OPTIONS.find((option) => option.value === tag)
        return {
          id: createRowId(),
          tagType: match ? tag : 'custom',
          tagTypeInput: tag,
          searchQuery: value ?? '',
          initialValue: value ?? '',
          initialRelay: relay ?? '',
          userOpen: false,
        }
      }),
    )
  }, [resolvedInitialTags])

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()])
  }

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
  }

  const updateRow = (id: string, patch: Partial<TagRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  return (
    <Paper outlined sx={styles.root}>
      <Stack horizontal={false} gap={1}>
        <Stack horizontal={false} gap={1} sx={styles.rowsScroll}>
          {rows.map((row) => {
            const resolvedTagType = row.tagType === 'custom' ? row.tagTypeInput.trim() : row.tagType
            return (
              <Stack key={row.id} horizontal={false} gap={0.5} sx={styles.tagBlock}>
                <Paper outlined surface='surfaceContainerLowest' sx={styles.tagRow}>
                  <PopoverBase
                    opened={tagTypeOpenId === row.id}
                    onClose={() => setTagTypeOpenId(null)}
                    placement='bottom-start'
                    openEvents={{ click: true }}
                    contentRenderer={() => (
                      <Paper elevation={3} surface='surfaceContainerLow' sx={styles.menuPaper}>
                        <html.div style={styles.menuScroll}>
                          <Stack gap={1} horizontal={false}>
                            {TAG_OPTIONS.map((option) => (
                              <ListItem
                                key={option.value}
                                interactive
                                size='sm'
                                selected={option.value === row.tagType}
                                onClick={() => {
                                  updateRow(row.id, { tagType: option.value, tagTypeInput: option.value })
                                  const input = tagTypeRefs.current[row.id]
                                  if (input) {
                                    input.value = option.value
                                  }
                                  setTagTypeOpenId(null)
                                }}>
                                {option.label}
                              </ListItem>
                            ))}
                          </Stack>
                        </html.div>
                      </Paper>
                    )}>
                    {({ setRef, getProps }) => (
                      <html.span ref={setRef} {...getProps()}>
                        <Stack>
                          <input
                            placeholder='Tag type'
                            defaultValue={row.tagTypeInput}
                            name={`tags[${row.id}][type]`}
                            {...css.props([styles.input, styles.input$tagType])}
                            onClick={() => setTagTypeOpenId(row.id)}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                              const nextValue = event.currentTarget.value
                              if (!nextValue.trim()) {
                                updateRow(row.id, { tagTypeInput: nextValue, tagType: 'custom' })
                                setTagTypeOpenId(null)
                                return
                              }
                              const match = TAG_OPTIONS.find((option) => option.value === nextValue.trim())
                              updateRow(row.id, {
                                tagTypeInput: nextValue,
                                tagType: match ? match.value : 'custom',
                              })
                              setTagTypeOpenId(null)
                            }}
                            ref={(node) => {
                              tagTypeRefs.current[row.id] = node
                            }}
                          />
                          <IconChevronDown size={14} />
                        </Stack>
                      </html.span>
                    )}
                  </PopoverBase>
                  <Divider orientation='vertical' sx={styles.divider} />
                  {resolvedTagType === 'p' ? (
                    <PopoverBase
                      opened={row.userOpen && row.searchQuery.trim().length > 0}
                      onClose={() => updateRow(row.id, { userOpen: false })}
                      placement='bottom-start'
                      contentRenderer={() => (
                        <Paper elevation={3} surface='surfaceContainerLow' sx={styles.menuPaper}>
                          <html.div style={styles.menuScroll}>
                            <SearchContent
                              dense
                              ref={(node) => {
                                userSearchRefs.current[row.id] = node
                              }}
                              query={row.searchQuery}
                              limit={50}
                              suggestQuery={false}
                              suggestRelays={false}
                              onSelect={(item) => {
                                if (item.type === 'user' || item.type === 'user_relay') {
                                  const input = tagValueRefs.current[row.id]
                                  if (input) {
                                    input.value = item.pubkey
                                  }
                                  updateRow(row.id, { searchQuery: item.pubkey, userOpen: false })
                                }
                              }}
                            />
                          </html.div>
                        </Paper>
                      )}>
                      {({ setRef, getProps }) => (
                        <html.span ref={setRef} {...getProps()}>
                          <input
                            placeholder='npub, nprofile, or hex'
                            defaultValue={row.searchQuery}
                            name={`tags[${row.id}][value]`}
                            {...css.props([styles.input, styles.input$value])}
                            onFocus={() => updateRow(row.id, { userOpen: true })}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                              updateRow(row.id, { searchQuery: event.currentTarget.value, userOpen: true })
                            }}
                            onKeyDown={(event) => {
                              const handled = userSearchRefs.current[row.id]?.onKeyDown({
                                event: event as unknown as React.KeyboardEvent<HTMLInputElement>,
                              })
                              if (handled) return
                              if (event.key === 'Enter') {
                                const safeEvent = event as unknown as { preventDefault?: () => void }
                                safeEvent.preventDefault?.()
                                updateRow(row.id, { userOpen: false })
                              }
                            }}
                            ref={(node) => {
                              tagValueRefs.current[row.id] = node
                            }}
                          />
                        </html.span>
                      )}
                    </PopoverBase>
                  ) : (
                    <input
                      placeholder={
                        resolvedTagType === 't' ? 'hashtag' : resolvedTagType === 'e' ? 'Event ID / nevent' : 'Value'
                      }
                      defaultValue={row.initialValue}
                      name={`tags[${row.id}][value]`}
                      {...css.props([styles.input, styles.input$value])}
                    />
                  )}
                  <Divider orientation='vertical' sx={styles.divider} />
                  <input
                    placeholder='wss://relay.hint'
                    defaultValue={row.initialRelay}
                    name={`tags[${row.id}][relay]`}
                    {...css.props([styles.input, styles.input$relay])}
                  />
                  <IconButton
                    size='sm'
                    variant='filledTonal'
                    onClick={() => removeRow(row.id)}
                    sx={styles.deleteButton}>
                    <IconX size={14} />
                  </IconButton>
                </Paper>
              </Stack>
            )
          })}
        </Stack>
        <Stack>
          <Button variant='filled' onClick={addRow}>
            <IconPlus size={14} />
            Add tag
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    padding: spacing.padding2,
  },
  menuPaper: {
    width: 260,
    overflow: 'visible',
  },
  menuScroll: {
    maxHeight: 400,
    overflowY: 'auto',
    padding: spacing['padding0.5'],
  },
  tagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.padding1,
    paddingInline: spacing.padding1,
    paddingBlock: spacing['padding0.5'],
    width: '100%',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing['padding0.5'],
  },
  input: {
    border: 'none',
    color: palette.onSurface,
    fontSize: typeScale.titleSize$md,
    paddingBlock: spacing.padding1,
    paddingInlineStart: spacing.padding1,
    minWidth: 120,
  },
  input$tagType: {
    paddingInlineStart: spacing.padding2,
    width: 140,
  },
  input$value: {
    minWidth: 300,
    flex: 1,
  },
  input$relay: {
    minWidth: 200,
  },
  divider: {
    alignSelf: 'stretch',
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  rowsScroll: {
    maxHeight: 420,
    overflowY: 'auto',
  },
  tagBlock: {
    width: '100%',
  },
  subtitle: {
    color: 'inherit',
  },
})
