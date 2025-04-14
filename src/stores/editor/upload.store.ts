import { action, makeAutoObservable, runInAction } from 'mobx'
import { uploadBlossom, uploadNIP96, type ImageAttributes, type UploadTask, type VideoAttributes } from 'nostr-editor'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
import { from, lastValueFrom, map, mergeMap, tap, toArray } from 'rxjs'

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/mpeg', 'video/webm']

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

type Options = {
  sign: (event: EventTemplate) => Promise<NostrEvent>
  defaultUploadType: 'blossom' | 'nip96'
  defaultUploadUrl: string
}

// Just for kind-20 notes that goes outside the editor
export class UploadStore {
  files = [] as (ImageAttributes | VideoAttributes)[]

  constructor(private options: Options) {
    makeAutoObservable(this, {
      selectFiles: action.bound,
    })
  }

  async hash(file: File) {
    return bufferToHex(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))
  }

  async uploadFiles() {
    return await lastValueFrom(
      from(this.files).pipe(
        mergeMap((file) => {
          const data = {
            file: file.file,
            serverUrl: file.uploadUrl,
            sign: this.options.sign,
          }
          const expiration = 10 * 365 * 24 * 3600 // 10 years, this should be optional on blossom
          this.setUploading(file)
          return from(
            file.uploadType === 'blossom' ? uploadBlossom({ ...data, expiration, hash: this.hash }) : uploadNIP96(data),
          ).pipe(map((response) => ({ file, response })))
        }),
        tap(({ file, response }) => this.setReponse(file, response)),
        toArray(),
        map((responses) => {
          const sorted = this.files.map((x) => x.sha256)
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
          ]
        }),
      ),
    )
  }

  reset() {
    this.files = []
  }

  setUploading(file: ImageAttributes | VideoAttributes) {
    file.uploading = true
  }

  setFileData(src: string, attrs: Partial<ImageAttributes | VideoAttributes>) {
    const file = this.files.find((x) => x.src === src)
    // only upload url for now
    if (file && attrs.uploadUrl) {
      file.uploadUrl = attrs.uploadUrl
    }
  }

  setReponse(file: ImageAttributes | VideoAttributes, response: UploadTask) {
    file.src = response.url
    file.tags = response.tags
    file.sha256 = response.sha256
    file.uploading = false
  }

  selectFiles() {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = allowedMimeTypes.join(',')
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files
      if (files) {
        Array.from(files).forEach((file) => {
          if (file) {
            runInAction(() => {
              this.files.push({
                file,
                src: URL.createObjectURL(file),
                alt: '',
                tags: [],
                sha256: '',
                uploading: false,
                uploadError: '',
                uploadType: this.options.defaultUploadType,
                uploadUrl: this.options.defaultUploadUrl,
              })
            })
          }
        })
      }
    }
    input.click()
  }

  delete(index: number) {
    this.files = this.files.filter((_, i) => i !== index)
  }
}
