import { compressImage, compressVideo, type ImageQuality } from '@/utils/compression'
import { uploadBlossom } from '@/utils/uploadBlossom'
import { uploadNIP96 } from '@/utils/uploadNIP96'
import { hashFile } from '@/utils/utils'
import { atom } from 'jotai'
import { type ImageAttributes, type VideoAttributes } from 'nostr-editor'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
import { defer, from, lastValueFrom, map, mergeMap, of, retry, tap, throwError, timer, toArray } from 'rxjs'
import invariant from 'tiny-invariant'
import { signerAtom } from './auth.atoms'
import { clearCompressionStateAtom, setCompressionStateAtom } from './compression.atoms'
import { settingsAtom, type Settings } from './settings.atoms'

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/mpeg',
  'video/webm',
] as const

const UPLOAD_MAX_ATTEMPTS = 3
const UPLOAD_RETRY_DELAY_SECONDS = 3

export type UploadFile = ImageAttributes | VideoAttributes
export type UploadConfig = {
  quality: ImageQuality
  includeAudio: boolean
  uploadType: 'blossom' | 'nip96'
  uploadUrl: string
}
export type UploadEditorFile = UploadFile & {
  id?: string
  pos?: number
  batchId?: string
}

export const filesAtom = atom<UploadEditorFile[]>([])
export const uploadConfigByBatchAtom = atom<Record<string, UploadConfig>>({})
export const uploadConfigByFileAtom = atom<Record<string, UploadConfig>>({})
export const uploadDialogConfigAtom = atom<UploadConfig>({
  quality: 'high',
  includeAudio: true,
  uploadType: 'nip96',
  uploadUrl: '',
})

export const getUploadFileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}:${file.type}`

const createDefaultUploadConfig = (settings: Settings) =>
  ({
    quality: 'high',
    includeAudio: true,
    uploadType: settings.defaultUploadType,
    uploadUrl: settings.defaultUploadUrl,
  }) satisfies UploadConfig

export const resetFileUploadAtom = atom(null, (_, set) => {
  set(filesAtom, [])
})

export const resetUploadDialogConfigAtom = atom(null, (get, set) => {
  const settings = get(settingsAtom)
  set(uploadDialogConfigAtom, createDefaultUploadConfig(settings))
})

export const setUploadDialogConfigAtom = atom(null, (get, set, config: Partial<UploadConfig>) => {
  const current = get(uploadDialogConfigAtom)
  set(uploadDialogConfigAtom, { ...current, ...config })
})

export const applyUploadConfigToFilesAtom = atom(null, (get, set) => {
  const files = get(filesAtom)
  const config = get(uploadDialogConfigAtom)
  const configByBatch = get(uploadConfigByBatchAtom)
  const configByFile = get(uploadConfigByFileAtom)
  const nextByBatch = { ...configByBatch }
  const nextByFile = { ...configByFile }

  files.forEach((file) => {
    if (file.batchId) {
      nextByBatch[file.batchId] = config
    }
    nextByFile[getUploadFileKey(file.file)] = config
  })

  set(uploadConfigByBatchAtom, nextByBatch)
  set(uploadConfigByFileAtom, nextByFile)
})

export const removeUploadConfigByFileAtom = atom(null, (get, set, file: File) => {
  const configByFile = get(uploadConfigByFileAtom)
  const key = getUploadFileKey(file)
  if (!configByFile[key]) return
  const next = { ...configByFile }
  delete next[key]
  set(uploadConfigByFileAtom, next)
})

export const resetIsUploadingAtom = atom(null, (get, set) => {
  const files = get(filesAtom)
  set(
    filesAtom,
    files.map((f) => ({ ...f, uploading: false })),
  )
})

export const deleteFileAtIndexAtom = atom(null, (get, set, index: number) => {
  const files = get(filesAtom)
  set(
    filesAtom,
    files.filter((_, i) => i !== index),
  )
})

export const setFileDataAtom = atom(null, (get, set, args: { src: string; attrs: Partial<UploadFile> }) => {
  const files = get(filesAtom)
  set(
    filesAtom,
    files.map((file) => {
      return file.src === args.src ? { ...file, ...args.attrs } : file
    }),
  )
})

export const addFileUploadAtom = atom(
  null,
  (get, set, args: { file: File; src: string; pos?: number }) => {
    const files = get(filesAtom)
    const batchId = crypto.randomUUID()
    if (files.some((item) => item.src === args.src)) {
      return
    }
    set(filesAtom, [
      ...files,
      {
        id: crypto.randomUUID(),
        file: args.file,
        src: args.src,
        alt: '',
        tags: [],
        sha256: '',
        uploading: false,
        error: '',
        pos: args.pos,
        batchId,
      } as UploadEditorFile,
    ])
  },
)

export const selectFilesForUploadAtom = atom(
  null,
  (
    get,
    set,
    args: {
      multiple?: boolean
      defaultUploadType?: 'nip96' | 'blossom'
      defaultUploadUrl?: string
      onSelect?: (files: UploadFile[]) => void
    } = {},
  ) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = args.multiple ?? true
    input.accept = allowedMimeTypes.join(',')
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files
      if (files) {
        const batchId = crypto.randomUUID()
        const newFiles = Array.from(files)
          .filter((file) => {
            if (!allowedMimeTypes.includes(file.type as (typeof allowedMimeTypes)[number])) {
              return false
            }
            return true
          })
          .map((file) => {
            return {
              file,
              src: URL.createObjectURL(file),
              alt: '',
              tags: [],
              sha256: '',
              uploading: false,
              error: '',
              batchId,
            } as UploadFile
          })
        const current = get(filesAtom)
        if (files.length > 0) {
          const data = [...current, ...newFiles]
          set(filesAtom, data)
          args.onSelect?.(data)
        }
      }
    }
    input.click()
  },
)

export const uploadFilesAtom = atom(null, async (get, set) => {
  const files = get(filesAtom)
  const pendingFiles = files.filter((file) => !file.sha256)
  const signer = get(signerAtom)
  const settings = get(settingsAtom)
  invariant(signer, 'No signer found')
  if (pendingFiles.length === 0) {
    return Promise.resolve(files.flatMap((x) => x.tags))
  }
  return await lastValueFrom(
    from(pendingFiles).pipe(
      mergeMap((file) => {
        const run = async () => {
          const fileConfig = get(uploadConfigByFileAtom)[getUploadFileKey(file.file)] || createDefaultUploadConfig(settings)
          const isVideo = file.file.type.startsWith('video/')
          let phase: 'compressing' | 'uploading' = 'compressing'
          const qualityLabel =
            fileConfig.quality === 'uncompressed'
              ? 'Uncompressed'
              : fileConfig.quality === 'low'
                ? 'Low Quality'
                : fileConfig.quality === 'medium'
                  ? 'Medium Quality'
                  : 'High Quality'
          const setCompression = (progress: number) => {
            if (phase !== 'compressing') return
            set(setCompressionStateAtom, {
              src: file.src,
              state: { progress, label: `Compressing to ${qualityLabel}` },
            })
          }
          const clearCompression = () => {
            set(clearCompressionStateAtom, file.src)
          }
          const setUploadProgress = (progress: number) => {
            set(setCompressionStateAtom, {
              src: file.src,
              state: {
                progress: Math.min(100, Math.max(0, progress)),
                label: `Uploading ${Math.round(progress)}%`,
              },
            })
          }

          set(setFileDataAtom, { src: file.src, attrs: { uploading: true, error: '' } })
          try {
            const compressedFile = isVideo
              ? await compressVideo(file.file, fileConfig.quality, fileConfig.includeAudio, setCompression)
              : await compressImage(file.file, fileConfig.quality, setCompression)
            phase = 'uploading'
            setUploadProgress(0)
            const data = {
              file: compressedFile,
              hash: hashFile,
              serverUrl: fileConfig.uploadUrl || settings.defaultUploadUrl,
              expiration: 10 * 365 * 24 * 3600, // 10 years, this should be optional on blossom
              sign: signer.sign as (event: EventTemplate) => Promise<NostrEvent>,
              onProgress: setUploadProgress,
            }
            const uploadRequest = () =>
              fileConfig.uploadType === 'blossom' ? uploadBlossom(data) : uploadNIP96(data)

            const response = await lastValueFrom(
              defer(uploadRequest).pipe(
                mergeMap((result) => {
                  if (result.error) {
                    return throwError(() => new Error(result.error))
                  }
                  return of(result)
                }),
                retry({
                  count: UPLOAD_MAX_ATTEMPTS - 1,
                  delay: () => {
                    set(setCompressionStateAtom, {
                      src: file.src,
                      state: { progress: 100, label: `Retrying in ${UPLOAD_RETRY_DELAY_SECONDS} seconds` },
                    })
                    return timer(UPLOAD_RETRY_DELAY_SECONDS * 1000).pipe(
                      tap(() => {
                        set(setCompressionStateAtom, {
                          src: file.src,
                          state: { progress: 0, label: 'Uploading 0%' },
                        })
                      }),
                    )
                  },
                }),
              ),
            )
            return { file, response }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            set(setFileDataAtom, {
              src: file.src,
              attrs: {
                error: message,
                uploading: false,
              },
            })
            throw error
          } finally {
            clearCompression()
          }
        }
        return from(run())
      }),
      tap(({ file, response }) => {
        if (response.result && !response.error) {
          set(setFileDataAtom, {
            src: file.src,
            attrs: {
              src: response.result?.url,
              tags: response.result?.tags,
              sha256: response.result?.sha256,
              uploading: false,
            },
          })
        } else if (response.error) {
          set(setFileDataAtom, {
            src: file.src,
            attrs: {
              src: response.result?.url,
              error: response.error,
              uploading: false,
            },
          })
          // we don't want to proceed if any file got an error
          throw new Error(response.error)
        }
      }),
      toArray(),
      map((responses) => {
        const sorted = files.map((x) => x.src)
        const imetas = responses
          .map((x) => ({ file: x.file, result: x.response.result! }))
          .filter((x) => !!x.result)
          // This is to guarantee the order of files the user intend to upload
          .sort((a, b) => sorted.indexOf(a.file.src) - sorted.indexOf(b.file.src))
          .map(({ file, result }) => {
            // Provide default imeta based on what we know
            const meta: Record<string, string> = {
              url: result?.url,
              x: result?.sha256,
              m: file.file.type,
            }
            // Add imeta based on tags returned by our uploader
            for (const [k, v] of result.tags) {
              meta[k] = v
            }

            return [
              'imeta',
              ...Object.entries(meta)
                .map((kv) => kv.join(' '))
                .sort(),
            ]
          })
        const imetaQueryable =
          responses.length === 1
            ? [
              responses[0].response.result?.tags.find((x) => x[0] === 'm') || [],
              responses[0].response.result?.tags.find((x) => x[0] === 'x') || [],
            ]
            : []
        const tags = [
          ...imetas,
          ...imetaQueryable,
          ['alt', `This image was publish on nosotros.app ${responses[0].response.result?.url}`],
        ].filter((x) => x.length >= 2)

        responses.forEach(({ response }) => {
          // update tags for each file
          if (response.result?.url) {
            set(setFileDataAtom, { src: response.result.url, attrs: { tags } })
          }
        })

        return tags
      }),
    ),
  )
})
