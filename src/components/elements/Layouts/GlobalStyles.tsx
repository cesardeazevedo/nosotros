import { GlobalStyles as MuiGlobalStyles } from '@mui/material'
import { observer } from 'mobx-react-lite'

const GlobalStyles = observer(function GlobalStyles() {
  return (
    <MuiGlobalStyles
      styles={{
        '.deck': {
          height: 'calc(100% - 64px)',
          body: {
            height: '100%',
          },
          '#root': {
            height: '100%',
          },
        },
      }}
    />
  )
})

export default GlobalStyles
