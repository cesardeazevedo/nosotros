import { Kind } from '@/constants/kinds'
import { kinds, type NostrEvent, type UnsignedEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { EMPTY, filter, firstValueFrom, from, map, mergeMap, of, shareReplay, take } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import invariant from 'tiny-invariant'
import { NostrPublisher } from '../NostrPublish'
import { NostrSubscription } from '../NostrSubscription'
import { broadcast } from '../operators/broadcast'
import { subscribe } from '../operators/subscribe'
import { verify } from '../operators/verify'
import { Pool } from '../pool'
import { Relay } from '../Relay'
import { type NostrFilter } from '../types'
import { NIP01Signer } from './nip01.signer'
import type { Signer } from './signer'

const BUNKER_REGEX = /^bunker:\/\/([0-9a-f]{64})\??([?/\w:.=&%-]*)$/

type NIP05Response = {
  names?: Record<string, string>
  nip46?: {
    iframe_url?: string
    relays?: string[]
  } & {
    [pubkey: string]: string[]
  }
}

type BunkerMethodNIP05 = {
  method: 'nip05'
  nip05: string
}

type BunkerMethodURL = {
  method: 'bunkerurl'
  bunkerUrl: string
}

type BunkerMethodNostrConnect = {
  method: 'nostrconnect'
  relay: string
}

export type BunkerMethods = BunkerMethodNIP05 | BunkerMethodURL | BunkerMethodNostrConnect

export type NIP46RemoteSignerOptions = {
  secret?: string
  clientSecret?: string
  remotePubkey?: string
  url?: string
  name?: string
  description?: string
  method: BunkerMethods
}

export type MessageDecrypted = {
  id: string
  result: string
  error: string
}

export type BunkerPointer = {
  relay: string
  pubkey: string
  secret?: string
}

type BunkerEvent = [BunkerPointer, NostrEvent, MessageDecrypted]
type BunkerPubkey = [BunkerPointer, string]

function buildNostrConnectUrl(relay: string, pubkey: string, options: Omit<NIP46RemoteSignerOptions, 'method'>) {
  const { clientSecret, ...rest } = options
  const params = new URLSearchParams({ ...rest })
  params.append('relay', relay)
  return `nostrconnect://${pubkey}?${params.toString()}`
}

function fetchNIP05(nip05: string) {
  const [username, url] = nip05.split('@')
  return fromFetch<NIP05Response>(`https://${url}/.well-known/nostr.json?name=${username}`, {
    selector: (res) => res.json(),
    mode: 'cors',
    credentials: 'omit',
  }).pipe(
    map((res) => {
      const pubkey = res.names?.[username]
      const relay = pubkey ? res.nip46?.[pubkey][0] : undefined
      invariant(relay, 'No relays found on remote signer (NIP-05)')
      return { relay, pubkey } as BunkerPointer
    }),
  )
}

function parseBunkerUrl(input: string) {
  const match = input.match(BUNKER_REGEX)
  invariant(match, 'Error on parsing bunkerUrl')
  const pubkey = match[1]
  const qs = new URLSearchParams(match[2])
  return {
    pubkey,
    relay: qs.get('relay'),
    secret: qs.get('secret'),
  } as BunkerPointer
}

const pool = new Pool({ allowLocalConnection: true })

export class NIP46RemoteSigner implements Signer<NIP46RemoteSignerOptions> {
  name = 'nip46'

  secret: string
  options: NIP46RemoteSignerOptions
  nostrconnect?: string

  clientSigner: NIP01Signer

  events$: Observable<BunkerEvent>
  bunker$: Observable<BunkerPointer>
  connected$: Observable<BunkerPubkey>

  constructor(options: NIP46RemoteSignerOptions) {
    this.options = options
    this.secret = options.secret || Math.random().toString(36).slice(-7)
    this.clientSigner = new NIP01Signer(options.clientSecret)

    this.bunker$ = of(this.options.method).pipe(
      mergeMap((options) => {
        switch (options.method) {
          case 'nip05': {
            return fetchNIP05(options.nip05)
          }
          case 'bunkerurl': {
            return of(parseBunkerUrl(options.bunkerUrl))
          }
          case 'nostrconnect': {
            return of({ relay: options.relay } as BunkerPointer)
          }
          default: {
            throw new Error('Invalid bunker parameters')
          }
        }
      }),

      shareReplay(1),
    )

    this.events$ = this.bunker$.pipe(
      mergeMap((bunker) => this.subscribeBunker(bunker)),
      shareReplay(1),
    )

    // Cached connected response
    this.connected$ = this.events$.pipe(
      filter(([, , res]) => {
        if (res.result === 'auth_url') {
          window.open(res.error, 'popup', 'width=600,height800')
          return false
        }
        return true
      }),

      filter(([, , res]) => res.result === 'ack' || res.result === this.secret),

      mergeMap(([bunker, event]) => this.send('get_public_key', [], bunker, bunker.pubkey || event.pubkey)),

      map(([bunker, res]) => [bunker, res.result] as BunkerPubkey),

      take(1),

      shareReplay(1),
    )
  }

  getNostrconnect() {
    invariant(this.options.method.method === 'nostrconnect', 'No relays provided')
    const { method, ...rest } = this.options
    return buildNostrConnectUrl(this.options.method.relay, this.clientSigner.pubkey, {
      ...rest,
      secret: this.secret,
    })
  }

  private subscribeBunker(bunker: BunkerPointer): Observable<BunkerEvent> {
    const subFilter: NostrFilter = {
      kinds: [Kind.NostrConnect],
      '#p': [this.clientSigner.pubkey],
    }
    if (bunker.pubkey) {
      subFilter.authors = [bunker.pubkey]
    }

    const sub = new NostrSubscription(subFilter)
    const relay = pool.get(bunker.relay) || new Relay(bunker.relay)

    return of(sub).pipe(
      subscribe(relay, undefined, false),

      mergeMap(async ([, event]) => {
        const pubkey = bunker.pubkey || event.pubkey
        const msg = event.content
        const decrypted = event.content.includes('?iv=')
          ? await this.clientSigner.decrypt04(pubkey, msg)
          : await this.clientSigner.decrypt(pubkey, msg)
        const res = JSON.parse(decrypted)
        return [bunker, event, res] as BunkerEvent
      }),
    )
  }

  private send(method: string, params: string[], bunker: BunkerPointer, remotePubkey?: string) {
    const id = Math.random().toString().slice(2)
    const msg = JSON.stringify({ id, method, params })
    const pubkey = this.options.remotePubkey || remotePubkey || bunker.pubkey
    return from(this.clientSigner.encrypt(pubkey, msg)).pipe(
      mergeMap((encryptedContent) => {
        const event = {
          kind: kinds.NostrConnect,
          created_at: Math.floor(Date.now() / 1000),
          content: encryptedContent,
          tags: [['p', pubkey]],
        } as UnsignedEvent

        const publisher = new NostrPublisher(event, { signer: this.clientSigner, relays: of([bunker.relay]) })
        return of(publisher).pipe(broadcast(pool))
      }),
      mergeMap(() => {
        return this.events$.pipe(
          filter(([, , res]) => res.id === id),
          take(1),
        )
      }),
      map(([, , res]) => {
        if (res.error?.toLowerCase() === 'unauthorized') {
          throw new Error(res.error)
        }
        return [bunker, res] as const
      }),
    )
  }

  ping() {
    return this.events$.pipe(mergeMap(([bunker]) => this.send('ping', [], bunker))).subscribe()
  }

  async connect() {
    return firstValueFrom(
      this.bunker$.pipe(
        mergeMap((bunker) => this.send('connect', [bunker.pubkey, bunker.secret || this.secret], bunker)),
      ),
    )
  }

  async getPublicKey() {
    return firstValueFrom(
      this.connected$.pipe(mergeMap(([bunker, pubkey]) => this.send('get_public_key', [], bunker, pubkey))),
    )
  }

  async sign(event: UnsignedEvent): Promise<NostrEvent> {
    return firstValueFrom(
      this.bunker$.pipe(
        mergeMap((bunker) => {
          return this.options.remotePubkey ? this.send('sign_event', [JSON.stringify(event)], bunker) : EMPTY
        }),
        map(([, res]) => JSON.parse(res.result) as NostrEvent),
        verify(),
      ),
    )
  }

  encrypt(_pubkey: string, msg: string) {
    return firstValueFrom(
      this.connected$.pipe(
        mergeMap(([bunker]) => this.send('encrypt', [msg], bunker)),
        map(([, res]) => res.result),
      ),
    )
  }

  decrypt(_pubkey: string, msg: string) {
    return firstValueFrom(
      this.connected$.pipe(
        mergeMap(([bunker]) => this.send('decrypt', [msg], bunker)),
        map(([, res]) => res.result),
      ),
    )
  }
}
