import { buttonTokens } from '@/components/ui/Button/Button.stylex'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Switch } from '@/components/ui/Switch/Switch'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { EditorStore } from '@/stores/editor/editor.store'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconCode } from '@tabler/icons-react'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { observer } from 'mobx-react-lite'
import { lazy, Suspense, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  store: EditorStore
}

const jsonTheme = {
  ...githubDarkTheme,
  '--w-rjv-background-color': '#0d0f12',
}

const JsonView = lazy(() => import('@uiw/react-json-view'))

export const EditorSettings = observer(function EditorSettings(props: Props) {
  const [jsonOpen, setJsonOpen] = useState(false)
  const { store } = props

  return (
    <>
      <Stack horizontal={false} gap={1} sx={styles.root} align='stretch' justify='flex-start'>
        <Stack horizontal={false} sx={styles.content} gap={2} align='flex-start' justify='flex-start'>
          <Stack gap={1}>
            <Text variant='title' size='lg'>
              Options
            </Text>
            <Tooltip text='See Raw Event'>
              <IconButton toggle={jsonOpen} size='sm' onClick={() => setJsonOpen((prev) => !prev)}>
                <IconCode strokeWidth='2.0' size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack horizontal={false} gap={1}>
            <Stack gap={1}>
              <Text size='md' sx={styles.label}>
                Client tag
              </Text>
              <Switch checked={store.clientEnabled.value} onChange={() => store.clientEnabled.toggle()} />
            </Stack>
            <Text size='sm' sx={styles.description}>
              Client tag will let other users know you are using nosotros
            </Text>
            <Stack gap={1}>
              <Text size='md' sx={styles.label}>
                NSFW
              </Text>
              <Switch checked={store.nsfwEnabled.value} onChange={() => store.nsfwEnabled.toggle()} />
            </Stack>
          </Stack>
        </Stack>
        <Stack>
          {jsonOpen && (
            <Suspense>
              <JsonView
                highlightUpdates={false}
                displayDataTypes={false}
                value={store.event}
                {...css.props(styles.json)}
                style={{ ...jsonTheme }}
              />
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
    borderBottomLeftRadius: shape.xl,
    borderBottomRightRadius: shape.xl,
  },
  content: {
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
  label: {
    minWidth: 180,
    fontWeight: 500,
  },
  description: {
    maxWidth: 240,
  },
})
