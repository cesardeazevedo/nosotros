import { Button } from '@/components/ui/Button/Button'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Paper } from '@/components/ui/Paper/Paper'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import React, { lazy, Suspense } from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { css, html } from 'react-strict-dom'

type Props = {
  event: NostrEventDB
  onClose?: () => void
}

const JsonView = lazy(() => import('@uiw/react-json-view'))

const Panel = (props: { children: React.ReactNode; label: string; value?: object; defaultExpanded?: boolean }) => {
  const { label, defaultExpanded, children } = props
  return (
    <Expandable
      initiallyExpanded={defaultExpanded}
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
  const isMobile = useMobile()
  return (
    <html.div style={styles.jsonview}>
      {value && (
        <Suspense fallback={<Skeleton sx={styles.loading} />}>
          <JsonView
            value={value}
            collapsed={false}
            shortenTextAfterLength={64}
            style={{
              backgroundColor: 'black',
              overflow: 'auto',
              padding: 12,
              maxHeight: isMobile ? '100%' : 300,
              ...githubDarkTheme,
            }}
            displayDataTypes={false}
            enableClipboard={true}
          />
        </Suspense>
      )}
    </html.div>
  )
}

export const PostStats = (props: Props) => {
  const { event, onClose } = props
  const { ...data } = event
  const isMobile = useMobile()
  return (
    <RemoveScroll>
      <html.div style={styles.root}>
        <html.div style={[styles.header, isMobile && styles.header$mobile]}>
          <Text variant='headline'>Note Stats</Text>
        </html.div>
        <Stack horizontal={false} sx={[styles.content, isMobile && styles.content$mobile]} gap={2}>
          <Paper outlined shape={isMobile ? 'none' : 'lg'} sx={styles.paper}>
            {/* <Panel defaultExpanded label='Relays'> */}
            {/*   {note.seenOn.map((relay) => ( */}
            {/*     <RelayChip relay={relay} /> */}
            {/*   ))} */}
            {/* </Panel> */}
            <Panel defaultExpanded label='Raw Event'>
              <JsonContent value={data} />
            </Panel>
            {/* <Panel label='User Raw Event'> */}
            {/*   <JsonContent value={note.user?.meta} /> */}
            {/* </Panel> */}
          </Paper>
          <Stack justify='flex-end'>
            <Button onClick={onClose}>Close</Button>
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
  header$mobile: {
    padding: spacing.padding2,
  },
  content: {
    paddingTop: spacing.padding2,
    paddingInline: spacing.padding2,
    paddingBottom: spacing.padding2,
  },
  content$mobile: {
    padding: 0,
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
  loading: {
    width: 550,
    height: 300,
  },
})
