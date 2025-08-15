import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconBolt } from '@tabler/icons-react'
import { memo, type RefObject } from 'react'
import { css } from 'react-strict-dom'
import { useEditorSection, useEditorSelector } from '../hooks/useEditor'

type Props = IconButtonProps & {
  ref?: RefObject<HTMLButtonElement>
}

export const EditorButtonZapSplits = memo(function EditorButtonMentions(props: Props) {
  const { ...rest } = props
  const { dense } = useContentContext()
  const { section, openSection } = useEditorSection()
  const zapSplitsEnabled = useEditorSelector((editor) => editor.zapSplitsEnabled)

  return (
    <Tooltip cursor='arrow' text='Zap Splits' enterDelay={200}>
      <IconButton
        {...rest}
        toggle={section === 'zaps' || zapSplitsEnabled}
        selected={section === 'zaps' || zapSplitsEnabled}
        size={dense ? 'sm' : 'md'}
        icon={<IconBolt {...css.props(zapSplitsEnabled && styles.fill)} size={dense ? 20 : 22} strokeWidth='1.6' />}
        onClick={() => openSection('zaps')}
      />
    </Tooltip>
  )
})

const styles = css.create({
  fill: {
    fill: colors.violet7,
    color: colors.violet7,
  },
})
