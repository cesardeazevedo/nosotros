import { setSettingsAtom, settingsAtom, toggleSettingAtom } from '@/atoms/settings.atoms'
import { useAtomValue, useSetAtom } from 'jotai'

export function useSettings() {
  return useAtomValue(settingsAtom)
}

export function useSetSettings() {
  return useSetAtom(setSettingsAtom)
}

export function useToggleSettings() {
  return useSetAtom(toggleSettingAtom)
}
