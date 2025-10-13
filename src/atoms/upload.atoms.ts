import { uploadBlossom } from '@/utils/uploadBlossom'
import { uploadNIP96 } from '@/utils/uploadNIP96'
import { hashFile } from '@/utils/utils'
import { atom } from 'jotai'
import { type ImageAttributes, type VideoAttributes } from 'nostr-editor'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
import { from, lastValueFrom, map, mergeMap, tap, toArray } from 'rxjs'
import invariant from 'tiny-invariant'
import { signerAtom } from './auth.atoms'
import { settingsAtom } from './settings.atoms'

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/mpeg',
  'video/webm',
] as const

export type UploadFile = ImageAttributes | VideoAttributes

export const filesAtom = atom<UploadFile[]>([])

export const resetFileUploadAtom = atom(null, (_, set) => {
  set(filesAtom, [])
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
  const signer = get(signerAtom)
  const settings = get(settingsAtom)
  invariant(signer, 'No signer found')
  if (files.filter((f) => !!f.sha256).length === files.length) {
    return Promise.resolve(files.flatMap((x) => x.tags))
  }
  return await lastValueFrom(
    from(files).pipe(
      mergeMap((file) => {
        const data = {
          file: file.file,
          hash: hashFile,
          serverUrl: settings.defaultUploadUrl,
          expiration: 10 * 365 * 24 * 3600, // 10 years, this should be optional on blossom
          sign: signer.sign as (event: EventTemplate) => Promise<NostrEvent>,
        }
        set(setFileDataAtom, { src: file.src, attrs: { uploading: true } })
        return from(settings.defaultUploadType === 'blossom' ? uploadBlossom(data) : uploadNIP96(data)).pipe(
          map((response) => ({ file, response })),
        )
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
