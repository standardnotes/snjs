import { ContentType } from '@standardnotes/common'

import { FeatureDescription } from './Feature'
import { ComponentArea } from '../Component/ComponentArea'
import { ComponentFlag } from './Flag'
import { PermissionName } from '../Permission/PermissionName'
import { FeatureIdentifier } from './FeatureIdentifier'
import featuresFromJson from './features.json'

type TFeatureItemFromJson = typeof featuresFromJson[0]

const features: FeatureDescription[] = []

const validateFeatureItem = (featureItem: TFeatureItemFromJson) => {
  const { identifier, permission_name, content_type, area, flags } = featureItem
  const permissionNames = Object.values(PermissionName)
  const featureIdentifiers = Object.values(FeatureIdentifier)
  const contentTypes = Object.values(ContentType)
  const componentArea = Object.values(ComponentArea)
  const flagTypes = Object.values(ComponentFlag)

  if (!featureIdentifiers.includes(identifier as FeatureIdentifier)) {
    throw Error(`Invalid feature identifier ${identifier}`)
  }
  if (!permissionNames.includes(permission_name as PermissionName)) {
    throw Error(`Invalid permission name ${permission_name}`)
  }
  if (content_type && !contentTypes.includes(content_type as ContentType)) {
    throw Error(`Invalid feature content type ${content_type}`)
  }
  if (area && !componentArea.includes(area as ComponentArea)) {
    throw Error(`Invalid feature area ${area}`)
  }
  if (flags && flags.some((flag) => !flagTypes.includes(flag as ComponentFlag))) {
    throw Error(`Invalid feature flag ${flags}`)
  }
}

for (const featureItem of featuresFromJson) {
  validateFeatureItem(featureItem)
  features.push(featureItem as FeatureDescription)
}

export const Features: FeatureDescription[] = features
