import { SNNote } from "./note";
import { PurePayload } from "@Lib/protocol/payloads";
import { SNTag } from "./tag";

export class SNNoteWithTags extends SNNote {
  constructor(
    payload: PurePayload,
    public readonly tags: SNTag[]
  ) {
    super(payload);
  }
}
