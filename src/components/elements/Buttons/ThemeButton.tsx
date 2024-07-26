import { IconButton, Zoom, useColorScheme, type IconButtonProps } from '@mui/material'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { useCallback } from 'react'
import Tooltip from '../Layouts/Tooltip'

function ThemeButton(props: IconButtonProps) {
  const { mode, setMode } = useColorScheme()

  const handleClick = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }, [mode, setMode])

  return (
    <Tooltip arrow title='Toggle dark / light theme' enterDelay={0}>
      <IconButton color='inherit' onClick={handleClick} {...props} sx={{ mx: 0.5, width: 40, height: 40, ...props.sx }}>
        <Zoom in={mode === 'light'}>
          <IconMoon style={{ position: 'absolute' }} strokeWidth='1.5' />
        </Zoom>
        <Zoom in={mode !== 'light'}>
          <IconSun style={{ position: 'absolute' }} strokeWidth='1.5' />
        </Zoom>
      </IconButton>
    </Tooltip>
  )
}

export default ThemeButton
