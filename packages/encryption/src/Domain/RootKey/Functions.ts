import { SNRootKey } from './RootKey'
import {
  DecryptedPayload,
  FillItemContent,
  RootKeyContent,
  RootKeyContentSpecialized,
} from '@standardnotes/models'
import { UuidGenerator } from '@standardnotes/utils'
import { ContentType } from '@standardnotes/common'
import { ProtocolVersion } from '@standardnotes/common'

export function CreateNewRootKey(content: RootKeyContentSpecialized): SNRootKey {
  const uuid = UuidGenerator.GenerateUuid()

  const payload = new DecryptedPayload<RootKeyContent>({
    uuid: uuid,
    content_type: ContentType.RootKey,
    content: FillRootKeyContent(content),
  })

  return new SNRootKey(payload)
}

export function FillRootKeyContent(content: Partial<RootKeyContentSpecialized>): RootKeyContent {
  if (!content.version) {
    if (content.dataAuthenticationKey) {
      /**
       * If there's no version stored, it must be either 001 or 002.
       * If there's a dataAuthenticationKey, it has to be 002. Otherwise it's 001.
       */
      content.version = ProtocolVersion.V002
    } else {
      content.version = ProtocolVersion.V001
    }
  }

  return FillItemContent(content) as RootKeyContent
}
