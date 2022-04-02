import { PurePayload } from '../Implementations/PurePayload'
import { CreateItemFromPayload } from '../../Item/Utilities/Generator'

/**
 * Compares the .content fields for equality, creating new SNItem objects
 * to properly handle .content intricacies.
 */
export function PayloadContentsEqual(payloadA: PurePayload, payloadB: PurePayload): boolean {
  const itemA = CreateItemFromPayload(payloadA)
  const itemB = CreateItemFromPayload(payloadB)
  return itemA.isItemContentEqualWith(itemB)
}
