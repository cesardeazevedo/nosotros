import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { settingsStore } from '@/stores/ui/settings.store'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

export const ThemeButton = observer(function ThemeButton(props: IconButtonProps) {
  const mode = settingsStore.theme

  const handleClick = useCallback(() => {
    settingsStore.setTheme(settingsStore.theme === 'dark' ? 'light' : 'dark')
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
