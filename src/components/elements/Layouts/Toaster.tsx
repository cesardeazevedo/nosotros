import { useGlobalSettings } from '@/hooks/useRootStore'
import { observer } from 'mobx-react-lite'
import { Toaster as SonnerToaster } from 'sonner'

export const Toaster = observer(() => {
  const globalSettings = useGlobalSettings()
  const theme = globalSettings.theme
  return (
    <SonnerToaster
      position='top-right'
      theme={theme === 'light' ? 'light' : 'dark'}
      style={{ marginTop: 62 }}
      visibleToasts={4}
      closeButton
    />
  )
})
