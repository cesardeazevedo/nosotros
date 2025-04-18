import type { Instance, SnapshotIn } from 'mobx-state-tree'
import { t } from 'mobx-state-tree'
import { withSetAction } from '../helpers/withSetAction'
import { withToggleAction } from '../helpers/withToggleAction'

type ImgProxyPreset = 'feed_img' | 'user_avatar'

const Languages = t.enumeration('Languages', ['en', 'pt'])
const ThemeKeysEnum = t.enumeration('ThemeKeys', ['light', 'dark', 'auto'])

const ScrollSettingsModel = t
  .model('ScrollSettingsModel', {
    zaps: t.boolean,
    replies: t.boolean,
    reposts: t.boolean,
    reactions: t.boolean,
  })
  .actions(withToggleAction)

export interface ScrollSettings extends Instance<typeof ScrollSettingsModel> {}
export interface ScrollSettingsSnapshotIn extends SnapshotIn<typeof ScrollSettingsModel> {}

export const GlobalSettingsModel = t
  .model('GlobalSettings', {
    lang: Languages,
    theme: ThemeKeysEnum,
    imgproxy: t.optional(t.string, import.meta.env.VITE_IMGPROXY_URL),
    defaultEmoji: t.optional(t.string, ''),
    defaultUploadType: t.optional(t.string, 'nip96'),
    defaultUploadUrl: t.optional(t.string, 'https://nostr.build'),
    sidebarCollapsed: t.optional(t.boolean, false),
    recentsCollapsed: t.optional(t.boolean, false),
    scroll: ScrollSettingsModel,
    clientTag: t.boolean,
  })
  .views((self) => ({
    getImgProxyUrl(preset: ImgProxyPreset, src: string) {
      return `${self.imgproxy}/_/${preset}/plain/${src}`
    },
  }))
  .actions(withSetAction)
  .actions(withToggleAction)

export interface GlobalSettings extends Instance<typeof GlobalSettingsModel> {}
