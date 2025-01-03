import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

export const ThemeButton = observer(function ThemeButton(props: IconButtonProps) {
  const globalSettings = useGlobalSettings()
  const mode = globalSettings.theme

  const handleClick = useCallback(() => {
    globalSettings.set('theme', globalSettings.theme === 'dark' ? 'light' : 'dark')
  }, [])

  return (
    <Tooltip cursor='arrow' text='Toggle dark / light theme' enterDelay={0}>
      <IconButton
        onClick={handleClick}
        {...props}
        sx={props.sx}
        icon={
          <>
            {mode === 'light' && <IconMoon strokeWidth='1.5' />}
            {mode !== 'light' && <IconSun strokeWidth='1.5' />}
          </>
        }
      />
    </Tooltip>
  )
})
