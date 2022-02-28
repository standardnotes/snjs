export type SingleRevision = {
  auth_hash?: string
  content_type: string
  content: string
  created_at: string
  enc_item_key: string
  /** The uuid of the item this revision was created with */
  item_uuid: string
  items_key_id: string
  updated_at: string
  /** The uuid of the revision */
  uuid: string
}
