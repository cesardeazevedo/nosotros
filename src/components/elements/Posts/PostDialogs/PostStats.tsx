import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import React from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { css, html } from 'react-strict-dom'
import type { Note } from 'stores/models/note'

type Props = {
  note: Note
}

const Panel = (props: { children: React.ReactNode; label: string; value?: object; defaultExpanded?: boolean }) => {
  const { label, defaultExpanded, children } = props
  return (
    <Expandable
      defaultExpanded={defaultExpanded}
      trigger={({ expand, expanded }) => (
        <>
          <Stack gap={1} sx={styles.panel} onClick={() => expand(!expanded)}>
            <IconButton icon={expanded ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />} />
            <Text variant='title' size='sm'>
              {label}
            </Text>
          </Stack>
        </>
      )}>
      {children}
    </Expandable>
  )
}

const JsonContent = function PostUserJson(props: { value?: object }) {
  const { value } = props
  return (
    <html.div style={styles.jsonview}>
      {value && (
        <JsonView
          value={value}
          collapsed={false}
          style={{ overflow: 'auto', padding: 12, maxHeight: 300, ...githubDarkTheme }}
          displayDataTypes={false}
          enableClipboard={true}
        />
      )}
    </html.div>
  )
}

export const PostStats = (props: Props) => {
  const { note } = props
  return (
    <RemoveScroll>
      <html.div style={styles.root}>
        <html.div style={styles.header}>
          <Text variant='headline'>Note Stats</Text>
        </html.div>
        <Stack horizontal={false} sx={styles.content} gap={2}>
          <Paper outlined sx={styles.paper}>
            {/* <Panel defaultExpanded label='Relays'> */}
            {/*   {note.seenOn.map((relay) => ( */}
            {/*     <RelayChip relay={relay} /> */}
            {/*   ))} */}
            {/* </Panel> */}
            <Panel defaultExpanded label='Raw Event'>
              <JsonContent value={note.event} />
            </Panel>
            <Panel label='User Raw Event'>
              <JsonContent value={note.user?.meta} />
            </Panel>
          </Paper>
          <Stack justify='flex-end'>
            <Button>Close</Button>
          </Stack>
        </Stack>
      </html.div>
    </RemoveScroll>
  )
}

const styles = css.create({
  root: {
    width: '100%',
  },
  header: {
    paddingTop: spacing.padding4,
    paddingInline: spacing.padding4,
  },
  content: {
    paddingTop: spacing.padding2,
    paddingInline: spacing.padding3,
    paddingBottom: spacing.padding2,
  },
  jsonview: {
    overflow: 'auto',
    width: '100%',
  },
  paper: {
    overflow: 'hidden',
  },
  panel: {
    cursor: 'pointer',
    padding: spacing.padding1,
  },
})
