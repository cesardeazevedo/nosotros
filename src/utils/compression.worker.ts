import type { FFmpeg } from '@ffmpeg/ffmpeg'

export type ImageQuality = 'uncompressed' | 'low' | 'medium' | 'high'
export type VideoQuality = ImageQuality

type VideoMetadata = {
  duration: number
  width: number
  height: number
  bitrate: number
  hasMotion: boolean
}

type CompressImageRequest = {
  id: string
  type: 'compress-image'
  file: File
  quality?: ImageQuality
}

type CompressVideoRequest = {
  id: string
  type: 'compress-video'
  file: File
  quality?: VideoQuality
  includeAudio: boolean
  metadata: VideoMetadata
}

type RequestMessage = CompressImageRequest | CompressVideoRequest

const MAX_IMAGE_BOUND = 2048
const QUALITY_MAP: Record<Exclude<ImageQuality, 'uncompressed'>, number> = {
  low: 60,
  medium: 75,
  high: 90,
}
const VIDEO_TARGET_MAP: Record<Exclude<VideoQuality, 'uncompressed'>, number> = {
  low: 8 * 1024 * 1024,
  medium: 25 * 1024 * 1024,
  high: 50 * 1024 * 1024,
}

const getOutputType = (mime: string) => {
  const type = mime.replace('image/', '')
  if (type === 'jpeg' || type === 'png' || type === 'webp' || type === 'avif') {
    return type
  }
  return 'webp'
}

const getQuality = (quality: ImageQuality | undefined) => {
  if (!quality || quality === 'uncompressed') {
    return undefined
  }
  return QUALITY_MAP[quality]
}

const encodeAvif = async (imageData: ImageData, quality?: number) => {
  const [{ default: avifEncoder }, { initEmscriptenModule }, { defaultOptions }] = await Promise.all([
    import('@jsquash/avif/codec/enc/avif_enc.js'),
    import('@jsquash/avif/utils.js'),
    import('@jsquash/avif/meta.js'),
  ])
  const module = await initEmscriptenModule(avifEncoder)
  const options = {
    ...defaultOptions,
    ...(quality ? { cqLevel: Math.max(0, Math.min(63, Math.round(63 - (quality / 100) * 63))) } : {}),
  }
  const output = module.encode(imageData.data, imageData.width, imageData.height, options)
  if (!output) {
    throw new Error('Encoding error.')
  }
  return output.buffer
}

const decodeImage = async (type: string, buffer: ArrayBuffer) => {
  switch (type) {
    case 'avif': {
      const avif = await import('@jsquash/avif/decode.js')
      return avif.default(buffer)
    }
    case 'jpeg': {
      const jpeg = await import('@jsquash/jpeg')
      return jpeg.decode(buffer)
    }
    case 'png': {
      const png = await import('@jsquash/png')
      return png.decode(buffer)
    }
    case 'webp': {
      const webp = await import('@jsquash/webp')
      return webp.decode(buffer)
    }
    default: {
      const webp = await import('@jsquash/webp')
      return webp.decode(buffer)
    }
  }
}

const encodeImage = async (type: string, imageData: ImageData, quality?: number) => {
  const options = quality ? ({ quality } as unknown as Record<string, unknown>) : undefined
  switch (type) {
    case 'avif': {
      return encodeAvif(imageData, quality)
    }
    case 'jpeg': {
      const jpeg = await import('@jsquash/jpeg')
      return jpeg.encode(imageData, options)
    }
    case 'png': {
      const png = await import('@jsquash/png')
      return png.encode(imageData)
    }
    case 'webp': {
      const webp = await import('@jsquash/webp')
      return webp.encode(imageData, options)
    }
    default: {
      const webp = await import('@jsquash/webp')
      return webp.encode(imageData, options)
    }
  }
}

const resizeImageData = async (imageData: ImageData, maxBound: number) => {
  const { width, height } = imageData
  const maxSide = Math.max(width, height)
  const scale = maxSide > maxBound ? maxBound / maxSide : 1
  const targetWidth = Math.round(width * scale)
  const targetHeight = Math.round(height * scale)

  if (scale === 1) {
    return imageData
  }

  const canvas = new OffscreenCanvas(targetWidth, targetHeight)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return imageData
  }
  const bitmap = await createImageBitmap(imageData)
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
  return ctx.getImageData(0, 0, targetWidth, targetHeight)
}

const compressImageInWorker = async (
  file: File,
  quality: ImageQuality | undefined,
  onProgress: (progress: number) => void,
) => {
  const mime = file.type
  const isImage = mime.startsWith('image/')
  const isGif = mime === 'image/gif'
  const shouldCompress = isImage && !isGif && quality !== 'uncompressed'
  if (!shouldCompress) {
    return file
  }

  onProgress(0)
  const outputType = getOutputType(mime)
  const buffer = await file.arrayBuffer()
  onProgress(20)
  const imageData = await decodeImage(outputType, buffer)
  onProgress(50)
  const resized = await resizeImageData(imageData, MAX_IMAGE_BOUND)
  onProgress(70)
  const encoded = await encodeImage(outputType, resized, getQuality(quality))
  onProgress(90)
  const blob = new Blob([encoded], { type: `image/${outputType}` })
  const name = file.name.replace(/\.\w+$/, `.${outputType}`)
  onProgress(100)
  return new File([blob], name, { type: blob.type })
}

const getFfmpeg = (() => {
  let instance: Promise<FFmpeg> | undefined
  return () => {
    if (!instance) {
      instance = (async () => {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg')
        const { toBlobURL } = await import('@ffmpeg/util')
        const ffmpeg = new FFmpeg()
        const coreURL = await toBlobURL((await import('@ffmpeg/core?url')).default, 'text/javascript')
        const wasmURL = await toBlobURL((await import('@ffmpeg/core/wasm?url')).default, 'application/wasm')
        const workerURL = (await import('@ffmpeg/ffmpeg/worker?url')).default
        await ffmpeg.load({ coreURL, wasmURL, classWorkerURL: workerURL })
        return ffmpeg
      })()
    }
    return instance
  }
})()

const pickVideoExt = (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext) {
    return ext
  }
  const type = file.type.replace('video/', '')
  return type || 'mp4'
}

const calculateOptimalResolution = (width: number, height: number, maxWidth: number) => {
  if (width <= maxWidth) {
    return { width, height }
  }
  const aspectRatio = width / height
  const newWidth = maxWidth
  const newHeight = Math.round(newWidth / aspectRatio)
  const evenWidth = newWidth % 2 === 0 ? newWidth : newWidth - 1
  const evenHeight = newHeight % 2 === 0 ? newHeight : newHeight - 1
  return { width: evenWidth, height: evenHeight }
}

const calculateCompressionSettings = (
  targetSize: number,
  metadata: VideoMetadata,
) => {
  const efficiency = metadata.hasMotion ? 0.8 : 0.85
  const targetBitrate = Math.round(((targetSize * 8) / metadata.duration / 1000) * efficiency)
  const audioBitrate = Math.min(128, Math.round(targetBitrate * 0.12))
  const rawVideoBitrate = Math.max(200, targetBitrate - audioBitrate)
  const videoBitrate = Math.min(rawVideoBitrate, Math.round(metadata.bitrate * 0.95))

  let maxWidth = metadata.width
  let crf = 23
  let targetFps = 30

  if (targetSize <= 8 * 1024 * 1024) {
    maxWidth = metadata.hasMotion ? 1024 : 854
    crf = metadata.hasMotion ? 18 : 26
    targetFps = 24
  } else if (targetSize <= 25 * 1024 * 1024) {
    maxWidth = metadata.hasMotion ? 1440 : 1280
    crf = metadata.hasMotion ? 16 : 24
    targetFps = 30
  } else if (targetSize <= 50 * 1024 * 1024) {
    maxWidth = 1920
    crf = metadata.hasMotion ? 14 : 22
    targetFps = 30
  } else {
    crf = metadata.hasMotion ? 12 : 20
  }

  const resolution = calculateOptimalResolution(metadata.width, metadata.height, maxWidth)
  const bufferSize = metadata.hasMotion ? `${videoBitrate * 3}k` : `${videoBitrate * 2}k`

  return {
    videoBitrate: `${videoBitrate}k`,
    audioBitrate: `${audioBitrate}k`,
    resolution,
    crf,
    bufferSize,
    targetFps,
  }
}

const compressVideoInWorker = async (
  file: File,
  quality: VideoQuality | undefined,
  includeAudio: boolean,
  metadata: VideoMetadata,
  onProgress: (progress: number) => void,
) => {
  const mime = file.type
  const isVideo = mime.startsWith('video/')
  const shouldCompress = isVideo && quality !== 'uncompressed'
  if (!shouldCompress) {
    return file
  }

  const ffmpeg = await getFfmpeg()
  const { fetchFile } = await import('@ffmpeg/util')
  const inputExt = pickVideoExt(file)
  const inputName = `input.${inputExt}`
  const outputName = `output.mp4`
  const baseTarget = quality ? VIDEO_TARGET_MAP[quality] : VIDEO_TARGET_MAP.high
  const ratio = quality === 'low' ? 0.3 : quality === 'medium' ? 0.5 : 0.7
  const targetSize = Math.max(1, Math.min(baseTarget, Math.floor(file.size * ratio)))
  const settings = calculateCompressionSettings(targetSize, metadata)
  const filters = [`scale=${settings.resolution.width}:${settings.resolution.height}:flags=fast_bilinear`]
  if (settings.targetFps && settings.targetFps < 30) {
    filters.push(`fps=${settings.targetFps}`)
  }
  const scaleFilter = filters.join(',')

  onProgress(5)
  const progressHandler = ({ progress }: { progress: number }) => {
    const mapped = 10 + Math.round(progress * 85)
    onProgress(Math.min(99, mapped))
  }

  ffmpeg.on('progress', progressHandler)
  try {
    await ffmpeg.deleteFile(inputName).catch(() => undefined)
    await ffmpeg.deleteFile(outputName).catch(() => undefined)

    const fileData = await fetchFile(file)
    await ffmpeg.writeFile(inputName, fileData)

    onProgress(10)
    const args = [
      '-y',
      '-i',
      inputName,
      '-vf',
      scaleFilter,
      '-c:v',
      'libx264',
      '-crf',
      String(settings.crf),
      '-maxrate',
      settings.videoBitrate,
      '-bufsize',
      settings.bufferSize,
      '-preset',
      'ultrafast',
      '-pix_fmt',
      'yuv420p',
      '-threads',
      '1',
      '-movflags',
      '+faststart',
      ...(includeAudio ? ['-c:a', 'aac', '-b:a', settings.audioBitrate] : ['-an']),
      outputName,
    ]
    const result = await ffmpeg.exec(args)
    if (typeof result === 'number' && result !== 0) {
      throw new Error(`ffmpeg exec failed with code ${result}`)
    }
    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([new Uint8Array(data)], { type: 'video/mp4' })
    const name = file.name.replace(/\.\w+$/, '.mp4')
    onProgress(100)
    return new File([blob], name, { type: blob.type })
  } finally {
    ffmpeg.off('progress', progressHandler)
    await ffmpeg.deleteFile(inputName).catch(() => undefined)
    await ffmpeg.deleteFile(outputName).catch(() => undefined)
  }
}

const postProgress = (id: string, progress: number) => {
  self.postMessage({ type: 'progress', id, progress })
}

self.onmessage = async (event: MessageEvent<RequestMessage>) => {
  const payload = event.data
  try {
    if (payload.type === 'compress-image') {
      const file = await compressImageInWorker(payload.file, payload.quality, (progress) => postProgress(payload.id, progress))
      self.postMessage({ type: 'done', id: payload.id, file })
      return
    }

    const file = await compressVideoInWorker(
      payload.file,
      payload.quality,
      payload.includeAudio,
      payload.metadata,
      (progress) => postProgress(payload.id, progress),
    )
    self.postMessage({ type: 'done', id: payload.id, file })
  } catch (error) {
    self.postMessage({
      type: 'error',
      id: payload.id,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
