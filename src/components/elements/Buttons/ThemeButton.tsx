import type { Props as IconButtonProps } from '@/components/ui/IconButton/IconButton'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useSetSettings, useSettings } from '@/hooks/useSettings'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { memo } from 'react'

export const ThemeButton = memo(function ThemeButton(props: IconButtonProps) {
  const settings = useSettings()
  const set = useSetSettings()
  const mode = settings.theme

  return (
    <Tooltip cursor='arrow' text='Toggle dark / light theme' enterDelay={0}>
      <IconButton
        onClick={() => set({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
        {...props}
        sx={props.sx}
        icon={
          <>
            {mode === 'light' && <IconMoon strokeWidth='2.5' />}
            {mode !== 'light' && <IconSun strokeWidth='2.5' />}
          </>
        }
      />
    </Tooltip>
  )
})
