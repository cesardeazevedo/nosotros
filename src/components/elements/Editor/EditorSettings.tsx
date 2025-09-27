import { buttonTokens } from '@/components/ui/Button/Button.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Switch } from '@/components/ui/Switch/Switch'
import { Text } from '@/components/ui/Text/Text'
import { useSettings, useToggleSettings } from '@/hooks/useSettings'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconBraces } from '@tabler/icons-react'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { lazy, memo, Suspense, useState } from 'react'
import { css } from 'react-strict-dom'
import { EditorSettingsUpload } from './EditorSettingsUpload'
import { useEditorSelector } from './hooks/useEditor'
import type { SxProps } from '@/components/ui/types'
import { shape } from '@/themes/shape.stylex'

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
  const toggleSettings = useToggleSettings()
  const toggle = useEditorSelector((editor) => editor.toggle)
  const settings = useSettings()
  const nsfwEnabled = useEditorSelector((editor) => editor.nsfwEnabled)

  return (
    <>
      <Stack horizontal={false} gap={1} sx={styles.root} align='stretch' justify='space-between'>
        <Stack horizontal={false} sx={styles.content} gap={2} align='stretch' justify='space-between'>
          <Stack grow gap={1} align='stretch' justify='space-between'>
            <Text variant='title' size='lg'>
              Options
            </Text>
          </Stack>
          <Stack grow gap={1} align='stretch' justify='space-between'>
            <Text size='lg' sx={styles.label}>
              Upload servers
            </Text>
            <EditorSettingsUpload />
          </Stack>
          <Stack grow gap={1} align='stretch' justify='space-between'>
            <Stack horizontal={false}>
              <Text size='lg' sx={styles.label}>
                Client tag
              </Text>
              <Text size='md' sx={styles.description}>
                Client tag will let other users know you are using nosotros
              </Text>
            </Stack>
            <Switch checked={settings.clientTag} onChange={() => toggleSettings('clientTag')} />
          </Stack>
          <Stack grow gap={1} align='stretch' justify='space-between'>
            <Text size='lg' sx={styles.label}>
              NSFW
            </Text>
            <Switch checked={nsfwEnabled} onChange={() => toggle('nsfwEnabled')} />
          </Stack>
          <Stack grow gap={1} align='stretch' justify='space-between'>
            <Text size='lg' sx={styles.label}>
              <Stack gap={1}>
                Show raw event <IconBraces strokeWidth='2.0' size={18} />
              </Stack>
            </Text>
            <Switch checked={jsonOpen} onChange={() => setJsonOpen((prev) => !prev)} />
          </Stack>
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
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    width: '100%',
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding3,
  },
  sign: {
    minHeight: 30,
    [buttonTokens.labelTextColor]: 'white',
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
  label: {
    minWidth: 180,
    fontWeight: 500,
  },
  description: {
    color: palette.onSurfaceVariant,
    maxWidth: 300,
  },
})
