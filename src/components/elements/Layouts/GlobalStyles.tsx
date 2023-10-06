import { GlobalStyles as MuiGlobalStyles } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useStore } from 'stores'

const GlobalStyles = observer(function GlobalStyles() {
  const store = useStore()

  useEffect(() => {
    if (store.deck.enabled) {
      document.documentElement.classList.add('deck')
    } else {
      document.documentElement.classList.remove('deck')
    }
  }, [store.deck.enabled])

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
