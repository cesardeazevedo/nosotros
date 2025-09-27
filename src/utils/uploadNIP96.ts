import type { UploadTask } from 'nostr-editor'
import type { EventTemplate, NostrEvent } from 'nostr-tools/core'
import { getToken } from 'nostr-tools/nip98'
import { readServerConfig, uploadFile } from './nip96'

export interface NIP96Options {
  file: File
  alt?: string
  serverUrl: string
  expiration?: number
  sign?: (event: EventTemplate) => Promise<NostrEvent> | NostrEvent
}

export async function uploadNIP96(options: NIP96Options): Promise<UploadTask> {
  if (!options.sign) {
    throw new Error('No signer provided')
  }
  const server = await readServerConfig(options.serverUrl)
  const authorization = await getToken(server.api_url, 'POST', options.sign, true)
  const res = await uploadFile(options.file, server.api_url, authorization, {
    alt: options.alt || '',
    expiration: options.expiration?.toString() || '',
    content_type: options.file.type,
  })
  const url = res.nip94_event?.tags.find((x) => x[0] === 'url')?.[1] || ''
  const sha256 = res.nip94_event?.tags.find((x) => x[0] === 'x')?.[1] || ''
  return {
    result: {
      url,
      sha256,
      tags: res.nip94_event?.tags || [],
    },
  }
}
