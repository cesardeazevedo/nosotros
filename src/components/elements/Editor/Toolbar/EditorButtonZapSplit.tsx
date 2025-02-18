import { useContentContext } from '@/components/providers/ContentProvider'
import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import type { EditorStore } from '@/stores/editor/editor.store'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconBolt } from '@tabler/icons-react'
import { forwardRef } from 'react'
import { css } from 'react-strict-dom'

type Props = IconButtonProps & {
  store: EditorStore
}

export const EditorButtonZapSplits = forwardRef<HTMLButtonElement, Props>(function EditorButtonMentions(
  props: Props,
  ref,
) {
  const { store, ...rest } = props
  const { dense } = useContentContext()

  return (
    <Tooltip cursor='arrow' text='Zap Splits' enterDelay={200}>
      <IconButton
        {...rest}
        ref={ref}
        toggle={store.section === 'zaps' || store.zapSplitsEnabled}
        selected={store.section === 'zaps' || store.zapSplitsEnabled}
        size={dense ? 'sm' : 'md'}
        icon={
          <IconBolt {...css.props(store.zapSplitsEnabled && styles.fill)} size={dense ? 20 : 22} strokeWidth='1.6' />
        }
        onClick={() => store.openSection('zaps')}
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
