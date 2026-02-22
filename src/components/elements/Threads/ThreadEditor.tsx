import type { SxProps } from '@/components/ui/types'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import type { NoteState } from '@/hooks/state/useNote'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { useDeferredValue } from 'react'
import { css, html } from 'react-strict-dom'
import { EditorProvider } from '../Editor/EditorProvider'

type Props = {
  note: NoteState
  sx?: SxProps
  onEditorDiscard?: () => void
}

export const ThreadEditor = (props: Props) => {
  const { note, sx, onEditorDiscard } = props
  const expanded = useDeferredValue(note.state.isReplying)
  return (
    <Expandable expanded={expanded} trigger={() => <></>}>
      <html.div style={[styles.root, sx]}>
        <html.div style={styles.anchor} />
        <html.div style={styles.thread} />
        <EditorProvider
          renderBubble
          initialOpen
          sx={styles.editor}
          parent={note.event}
          onSigned={() => note.actions.toggleReplies(true)}
          onUndoBroadcast={() => note.actions.toggleReplies(false)}
          onDiscard={onEditorDiscard}
        />
      </html.div>
    </Expandable>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    marginLeft: 38,
    paddingRight: spacing.padding1,
  },
  anchor: {
    position: 'absolute',
    left: 0,
    marginLeft: -4,
    top: 0,
    width: 19,
    height: 16,
    borderLeft: '3px solid',
    borderBottom: '3px solid',
    borderBottomLeftRadius: 18,
    borderLeftColor: palette.outlineVariant,
    borderBottomColor: palette.outlineVariant,
  },
  editor: {
    paddingTop: 0,
  },
  thread: {
    position: 'absolute',
    top: 0,
    left: -10,
    width: 12,
    bottom: 0,
    ':before': {
      content: '',
      position: 'relative',
      top: 0,
      left: 6,
      width: 3,
      borderRadius: 4,
      height: '100%',
      pointerEvents: 'none',
      display: 'inline-block',
      backgroundColor: palette.outlineVariant,
    },
  },
})
