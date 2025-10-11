import { openImageDialogAtom } from '@/atoms/dialog.atoms'
import { addMediaErrorAtom, mediaErrorsAtom } from '@/atoms/media.atoms'
import type { SxProps } from '@/components/ui/types'
import { useUserState } from '@/hooks/state/useUser'
import { palette } from '@/themes/palette.stylex'
import { getImgProxyUrl } from '@/utils/imgproxy'
import { useAtomValue, useSetAtom } from 'jotai'
import { css, html } from 'react-strict-dom'

type Props = {
  pubkey: string
  dense?: boolean
  sx?: SxProps
}

export const UserProfileBanner = function UserProfileBanner(props: Props) {
  const { pubkey, dense, sx } = props
  const user = useUserState(pubkey)
  const { banner } = user?.metadata || {}
  const hasError = useAtomValue(mediaErrorsAtom).has(banner || '')
  const pushImage = useSetAtom(openImageDialogAtom)
  const addError = useSetAtom(addMediaErrorAtom)

  if (banner && banner.startsWith('http') && !hasError) {
    return (
      <html.img
        src={getImgProxyUrl('high_res', banner)}
        style={[styles.root, dense && styles.root$dense, sx]}
        onClick={() => pushImage({ src: banner })}
        onError={() => addError(banner)}
      />
    )
  }
  return <html.div style={styles.fallback} />
}

const styles = css.create({
  root: {
    cursor: 'pointer',
    objectFit: 'cover',
    overflow: 'hidden',
    width: '100%',
    height: 240,
    margin: '0 auto',
    padding: 0,
  },
  root$dense: {
    height: 130,
  },
  fallback: {
    backgroundColor: palette.surfaceContainerLow,
    height: 240,
  },
})
