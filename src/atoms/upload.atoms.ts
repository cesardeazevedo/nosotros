import { atom } from 'jotai'
import { uploadBlossom, uploadNIP96, type ImageAttributes, type VideoAttributes } from 'nostr-editor'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
import { from, lastValueFrom, map, mergeMap, tap, toArray } from 'rxjs'
import invariant from 'tiny-invariant'
import { signerAtom } from './auth.atoms'
import { settingsAtom } from './settings.atoms'

// kind20 updates which happens outside the nostr-editor

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

function bufferToHex(buffer: ArrayBuffer) {
  const view = new Uint8Array(buffer)
  const out: string[] = []
  for (let i = 0; i < view.length; i++) {
    out.push(view[i].toString(16).padStart(2, '0'))
  }
  return out.join('')
}

async function hash(file: File) {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return bufferToHex(digest)
}

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

export const selectFilesForUploadAtom = atom(null, (get, set) => {
  const settings = get(settingsAtom)
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
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
            uploadError: '',
            uploadType: settings.defaultUploadType,
            uploadUrl: settings.defaultUploadUrl,
          } as UploadFile
        })
      const current = get(filesAtom)
      if (files.length > 0) {
        set(filesAtom, [...current, ...newFiles])
      }
    }
  }
  input.click()
})

export const uploadFilesAtom = atom(null, async (get, set) => {
  const files = get(filesAtom)
  const signer = get(signerAtom)
  invariant(signer, 'No signer found')
  return await lastValueFrom(
    from(files).pipe(
      mergeMap((file) => {
        const data = {
          file: file.file,
          serverUrl: file.uploadUrl,
          sign: signer.sign as (event: EventTemplate) => Promise<NostrEvent>,
        }
        const expiration = 10 * 365 * 24 * 3600 // 10 years, this should be optional on blossom
        set(setFileDataAtom, { src: file.src, attrs: { uploading: true } })
        return from(
          file.uploadType === 'blossom' ? uploadBlossom({ ...data, expiration, hash }) : uploadNIP96(data),
        ).pipe(map((response) => ({ file, response })))
      }),
      tap(({ file, response }) => {
        set(setFileDataAtom, {
          src: file.src,
          attrs: {
            src: response.url,
            tags: response.tags,
            sha256: response.sha256,
            uploading: false,
          },
        })
      }),
      toArray(),
      map((responses) => {
        const sorted = files.map((x) => x.sha256)
        const imetas = responses
          .filter((x) => !!x.response.sha256)
          .sort((a, b) => sorted.indexOf(a.response.sha256) - sorted.indexOf(b.response.sha256))
          .map(({ file, response }) => {
            // Provide default imeta based on what we know
            const meta: Record<string, string> = {
              url: response.url,
              x: response.sha256,
              m: file.file.type,
            }
            // Add imeta based on tags returned by our uploader
            for (const [k, v] of response.tags) {
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
                responses[0].response.tags.find((x) => x[0] === 'm') || [],
                responses[0].response.tags.find((x) => x[0] === 'x') || [],
              ]
            : []
        return [
          ...imetas,
          ...imetaQueryable,
          ['alt', `This image was publish on nosotros.app ${responses[0].response.url}`],
        ].filter((x) => x.length >= 2)
      }),
    ),
  )
})
