import { Toaster as SonnerToaster } from 'sonner'
import { settingsStore } from '@/stores/ui/settings.store'
import { observer } from 'mobx-react-lite'

export const Toaster = observer(() => {
  const theme = settingsStore.theme
  return <SonnerToaster theme={theme === 'light' ? 'dark' : 'light'} visibleToasts={4} closeButton />
})
