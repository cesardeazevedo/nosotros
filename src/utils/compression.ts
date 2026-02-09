export type ImageQuality = 'uncompressed' | 'low' | 'medium' | 'high'
export type VideoQuality = ImageQuality

import { filter, firstValueFrom, from, fromEvent, map, mergeMap, shareReplay, take, takeUntil, tap } from 'rxjs'

type VideoMetadata = {
  duration: number
  width: number
  height: number
  bitrate: number
  hasMotion: boolean
}

type WorkerRequest =
  | {
      id: string
      type: 'compress-image'
      file: File
      quality?: ImageQuality
    }
  | {
      id: string
      type: 'compress-video'
      file: File
      quality?: VideoQuality
      includeAudio: boolean
      metadata: VideoMetadata
    }

type WorkerProgressMessage = {
  type: 'progress'
  id: string
  progress: number
}

type WorkerDoneMessage = {
  type: 'done'
  id: string
  file: File
}

type WorkerErrorMessage = {
  type: 'error'
  id: string
  error: string
}

type WorkerMessage = WorkerProgressMessage | WorkerDoneMessage | WorkerErrorMessage
type WorkerTerminalMessage = WorkerDoneMessage | WorkerErrorMessage

const workers = [
  new Worker(new URL('./compression.worker.ts', import.meta.url), { type: 'module' }),
  new Worker(new URL('./compression.worker.ts', import.meta.url), { type: 'module' }),
]
let workerIndexCounter = 0

const workerMessage = from(workers).pipe(
  mergeMap((worker) =>
    fromEvent<MessageEvent<WorkerMessage>>(worker, 'message').pipe(takeUntil(fromEvent(worker, 'error'))),
  ),
  shareReplay(1),
)

const runInWorker = (request: WorkerRequest, onProgress?: (progress: number) => void) => {
  const worker = workers[workerIndexCounter++ % workers.length]

  const message$ = workerMessage.pipe(
    filter((event) => event.data.id === request.id),
    tap((event) => {
      if (event.data.type === 'progress') {
        onProgress?.(event.data.progress)
      }
    }),
    filter((event): event is MessageEvent<WorkerTerminalMessage> => event.data.type !== 'progress'),
    take(1),
    map((event) => {
      const message = event.data
      if (message.type === 'error') {
        throw new Error(message.error)
      }
      return message.file
    }),
  )

  worker.postMessage(request)
  return firstValueFrom(message$)
}

const getVideoMetadata = (file: File) => {
  return new Promise<VideoMetadata>((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      const duration = Math.max(0.1, video.duration || 0.1)
      const width = video.videoWidth || 0
      const height = video.videoHeight || 0
      const bitrate = Math.round((file.size * 8) / duration / 1000)
      const pixelCount = Math.max(1, width * height)
      const bitratePerPixel = (bitrate / pixelCount) * 1000
      const hasMotion = bitratePerPixel > 0.1 || bitrate > 3000
      URL.revokeObjectURL(video.src)
      resolve({ duration, width, height, bitrate, hasMotion })
    }
  })
}

export const compressImage = async (
  file: File,
  quality: ImageQuality | undefined,
  onProgress?: (progress: number) => void,
) => {
  const mime = file.type
  const isImage = mime.startsWith('image/')
  const isGif = mime === 'image/gif'
  const shouldCompress = isImage && !isGif && quality !== 'uncompressed'
  if (!shouldCompress) {
    return file
  }

  return runInWorker(
    {
      id: crypto.randomUUID(),
      type: 'compress-image',
      file,
      quality,
    },
    onProgress,
  )
}

export const compressVideo = async (
  file: File,
  quality: VideoQuality | undefined,
  includeAudio = true,
  onProgress?: (progress: number) => void,
) => {
  const mime = file.type
  const isVideo = mime.startsWith('video/')
  const shouldCompress = isVideo && quality !== 'uncompressed'
  if (!shouldCompress) {
    return file
  }

  const metadata = await getVideoMetadata(file)
  return runInWorker(
    {
      id: crypto.randomUUID(),
      type: 'compress-video',
      file,
      quality,
      includeAudio,
      metadata,
    },
    onProgress,
  )
}
