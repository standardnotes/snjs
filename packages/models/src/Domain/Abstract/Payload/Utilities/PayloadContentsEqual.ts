import { PurePayload } from '../PurePayload'
import { CreateItemFromPayload } from '../../Item/Generator'

/**
 * Compares the .content fields for equality, creating new SNItem objects
 * to properly handle .content intricacies.
 */
export function PayloadContentsEqual(payloadA: PurePayload, payloadB: PurePayload): boolean {
  const itemA = CreateItemFromPayload(payloadA)
  const itemB = CreateItemFromPayload(payloadB)
  return itemA.isItemContentEqualWith(itemB)
}
