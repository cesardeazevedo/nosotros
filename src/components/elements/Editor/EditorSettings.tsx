import { SettingsClientTag } from '@/components/modules/Settings/SettingsClientTag'
import { SettingsDelayBroadcast } from '@/components/modules/Settings/SettingsDelayBroadcast'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Switch } from '@/components/ui/Switch/Switch'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { lazy, memo, Suspense, useState } from 'react'
import { css } from 'react-strict-dom'
import { EditorSettingsUpload } from './EditorSettingsUpload'
import { useEditorSelector } from './hooks/useEditor'

const jsonTheme = {
  ...githubDarkTheme,
  '--w-rjv-background-color': '#000',
}

const JsonView = lazy(() => import('@uiw/react-json-view'))

const EditorJsonView = (props: { sx?: SxProps }) => {
  const event = useEditorSelector((editor) => editor.event)
  return (
    event && (
      <JsonView
        highlightUpdates={false}
        displayDataTypes={false}
        value={event}
        {...css.props(props.sx)}
        style={{ ...jsonTheme }}
      />
    )
  )
}

type Props = {
  float?: boolean
}

export const EditorSettings = memo(function EditorSettings(props: Props) {
  const [jsonOpen, setJsonOpen] = useState(false)
  const toggle = useEditorSelector((editor) => editor.toggle)
  const nsfwEnabled = useEditorSelector((editor) => editor.nsfwEnabled)

  return (
    <>
      <Stack horizontal={false} gap={1} sx={styles.root} align='stretch' justify='space-between'>
        <Stack horizontal={false} sx={styles.content} gap={2} align='stretch' justify='space-between'>
          <Stack grow gap={1} align='stretch' justify='space-between' sx={styles.header}>
            <Text variant='title' size='lg'>
              Editor settings
            </Text>
          </Stack>
          <MenuItem label='Upload servers' trailing={<EditorSettingsUpload />} />
          <SettingsDelayBroadcast />
          <SettingsClientTag />
          <MenuItem label='NSFW' trailing={<Switch checked={nsfwEnabled} onChange={() => toggle('nsfwEnabled')} />} />
          <MenuItem
            label='Show raw event'
            trailing={<Switch checked={jsonOpen} onChange={() => setJsonOpen((prev) => !prev)} />}
          />
        </Stack>
        <Stack>
          {jsonOpen && (
            <Suspense>
              <EditorJsonView sx={[styles.json, props.float && styles.json$float]} />
            </Suspense>
          )}
        </Stack>
      </Stack>
    </>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    paddingInline: spacing.padding3,
  },
  content: {
    width: '100%',
    paddingBlock: spacing.padding2,
  },
  json: {
    paddingTop: spacing.padding1,
    paddingLeft: spacing.padding2,
    height: 220,
    width: '100%',
    overflowY: 'auto',
  },
  json$float: {
    borderBottomLeftRadius: shape.lg,
    borderBottomRightRadius: shape.lg,
  },
})
