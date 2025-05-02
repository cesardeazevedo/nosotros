import { decodeBlurHash } from 'fast-blurhash'

export function useBlurhash(hash: string | undefined) {
  if (hash) {
    const decodeWidth = 32
    const decodeHeight = 32
    const pixels = decodeBlurHash(hash, decodeWidth, decodeHeight)
    const canvas = document.createElement('canvas')
    canvas.width = decodeWidth
    canvas.height = decodeHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const imageData = ctx.createImageData(decodeWidth, decodeHeight)
      imageData.data.set(pixels)
      ctx.putImageData(imageData, 0, 0)
      return canvas.toDataURL()
    }
  }
}
