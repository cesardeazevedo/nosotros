export const IMGPROXY_URL = import.meta.env.VITE_IMGPROXY_URL

type ImgProxyPreset = 'feed_img' | 'user_avatar' | 'high_res'

export function getImgProxyUrl(preset: ImgProxyPreset, src: string) {
  return `${IMGPROXY_URL}/_/${preset}/plain/${encodeURIComponent(src)}`
}
