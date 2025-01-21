import { t } from 'mobx-state-tree'
import { withSetAction } from '../helpers/withSetAction'

type ImgProxyPreset = 'feed_img' | 'user_avatar'

const Languages = t.enumeration('Languages', ['en', 'pt'])
const ThemeKeysEnum = t.enumeration('ThemeKeys', ['light', 'dark', 'auto'])

export const GlobalSettingsModel = t
  .model('GlobalSettings', {
    lang: Languages,
    theme: ThemeKeysEnum,
    imgproxy: t.optional(t.string, import.meta.env.VITE_IMGPROXY_URL),
    defaultEmoji: t.optional(t.string, ''),
  })
  .views((self) => ({
    getImgProxyUrl(preset: ImgProxyPreset, src: string) {
      return `${self.imgproxy}/_/${preset}/plain/${src}`
    },
  }))
  .actions(withSetAction)
