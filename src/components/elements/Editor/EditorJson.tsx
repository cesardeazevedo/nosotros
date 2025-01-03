import { buttonTokens } from '@/components/ui/Button/Button.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Switch } from '@/components/ui/Switch/Switch'
import { Text } from '@/components/ui/Text/Text'
import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import type { EditorStore } from '@/stores/editor/editor.store'
import { theme } from '@/themes/colors/dark.theme'
import { shape } from '@/themes/shape.stylex'
import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

type Props = {
  editor: EditorStore
}

const jsonTheme = {
  ...githubDarkTheme,
  '--w-rjv-background-color': '#0d0f12',
}

export const EditorJson = observer(function EditorJson(props: Props) {
  const settings = useGlobalNostrSettings()
  const { editor } = props

  return (
    <div {...css.props(theme.palette)}>
      <div {...css.props(styles.root)}>
        <Stack sx={styles.actions} gap={0.5}>
          <Stack gap={1}>
            <Text size='md'>Client tag</Text>
            <Switch checked={editor.context?.client.settings.clientTag} onChange={() => settings.toggle('clientTag')} />
          </Stack>
        </Stack>
        <JsonView
          highlightUpdates={false}
          displayDataTypes={false}
          value={editor.event}
          {...css.props(styles.json)}
          style={{ ...jsonTheme }}
        />
      </div>
    </div>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
    maxHeight: 300,
    overflowY: 'auto',
  },
  actions: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  sign: {
    minHeight: 30,
    [buttonTokens.labelTextColor]: 'white',
  },
  json: {
    padding: 12,
    borderBottomRightRadius: shape.xl,
    borderBottomLeftRadius: shape.xl,
  },
})
