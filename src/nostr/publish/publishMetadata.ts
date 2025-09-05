import { Kind } from '@/constants/kinds'
import type { UserSchema } from '@/hooks/parsers/parseUser'
import type { LocalPublisherOptions } from './publish'
import { publish } from './publish'

export function publishMetadata(pubkey: string, metadata: UserSchema, options: LocalPublisherOptions) {
  return publish(
    {
      kind: Kind.Metadata,
      content: JSON.stringify(metadata),
      pubkey,
      tags: [
        ['alt', `User profile for ${metadata.display_name}`],
        ...(Object.entries(metadata).filter(([, value]) => !!value) as string[][]),
      ],
    },
    options,
  )
}
